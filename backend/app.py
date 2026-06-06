import modal
import os
import base64
from io import BytesIO

app = modal.App("medvision-ai")

# Model dosyaları kalıcı olarak bu volume'da saklanır (her deploy'da yeniden indirilmez)
model_volume = modal.Volume.from_name("medgemma-cache", create_if_missing=True)

# Container image: Python 3.11 + gerekli kütüphaneler
image = (
    modal.Image.debian_slim(python_version="3.11")
    .pip_install([
        "torch",
        "transformers>=4.50.0",
        "accelerate",
        "Pillow",
        "fastapi[standard]",
        "httpx",
    ])
)


@app.cls(
    image=image,
    gpu="A10G",                        # 24GB VRAM — MedGemma 4b-it için yeterli
    volumes={"/model-cache": model_volume},
    secrets=[
        modal.Secret.from_name("huggingface-token"),
        modal.Secret.from_name("supabase-config"),
    ],
    timeout=300,
    scaledown_window=300,              # 5 dk hareketsizlik sonrası container kapanır
)
@modal.concurrent(max_inputs=4)
class MedGemmaBackend:

    @modal.enter()
    def load_model(self):
        """Container başlarken bir kez çalışır — modeli belleğe yükler."""
        import torch
        from transformers import AutoProcessor, AutoModelForImageTextToText

        os.environ["HF_HOME"] = "/model-cache"
        hf_token = os.environ.get("HF_TOKEN")

        model_id = "google/medgemma-4b-it"
        print(f"MedGemma yükleniyor: {model_id}")

        self.processor = AutoProcessor.from_pretrained(model_id, token=hf_token)
        self.model = AutoModelForImageTextToText.from_pretrained(
            model_id,
            torch_dtype=torch.bfloat16,
            device_map="auto",
            token=hf_token,
        )
        self.model.eval()
        print("Model hazır!")

    def _decode_image(self, b64: str):
        from PIL import Image
        data = base64.b64decode(b64)
        return Image.open(BytesIO(data)).convert("RGB")

    def _generate(self, messages: list, max_tokens: int = 600) -> str:
        import torch
        inputs = self.processor.apply_chat_template(
            messages,
            add_generation_prompt=True,
            tokenize=True,
            return_dict=True,
            return_tensors="pt",
        )
        inputs = {k: v.to(self.model.device) for k, v in inputs.items()}

        with torch.inference_mode():
            out = self.model.generate(
                **inputs,
                max_new_tokens=max_tokens,
                do_sample=False,
            )

        prompt_len = inputs["input_ids"].shape[-1]
        return self.processor.decode(out[0][prompt_len:], skip_special_tokens=True)

    @modal.asgi_app()
    def api(self):
        from fastapi import Depends, FastAPI, HTTPException
        from fastapi.middleware.cors import CORSMiddleware
        from fastapi.security import HTTPAuthorizationCredentials, HTTPBearer
        from pydantic import BaseModel
        import httpx

        web = FastAPI(title="MedVision AI Backend")
        web.add_middleware(
            CORSMiddleware,
            allow_origins=["*"],
            allow_methods=["*"],
            allow_headers=["*"],
        )

        SUPABASE_URL = os.environ.get("SUPABASE_URL", "")
        SUPABASE_KEY = os.environ.get("SUPABASE_ANON_KEY", "")
        bearer = HTTPBearer()

        async def auth(creds: HTTPAuthorizationCredentials = Depends(bearer)):
            """Supabase JWT token'ını doğrular."""
            async with httpx.AsyncClient() as c:
                r = await c.get(
                    f"{SUPABASE_URL}/auth/v1/user",
                    headers={
                        "Authorization": f"Bearer {creds.credentials}",
                        "apikey": SUPABASE_KEY,
                    },
                )
            if r.status_code != 200:
                raise HTTPException(status_code=401, detail="Geçersiz oturum. Lütfen tekrar giriş yapın.")
            return r.json()

        class AnalyzeReq(BaseModel):
            image_base64: str
            doctor_note: str = ""

        class ChatMsg(BaseModel):
            role: str
            content: str

        class ChatReq(BaseModel):
            image_base64: str
            messages: list[ChatMsg]

        @web.get("/health")
        async def health():
            return {"status": "ok", "model": "medgemma-4b-it"}

        @web.post("/analyze")
        async def analyze(req: AnalyzeReq, user=Depends(auth)):
            """
            Tıbbi görüntüyü analiz eder.
            İngilizce rapor üretir, ardından Türkçeye çevirir.
            """
            try:
                img = self._decode_image(req.image_base64)
                note = f"\nClinician note: {req.doctor_note}" if req.doctor_note else ""

                en_prompt = (
                    "You are a medical AI assistant helping clinicians. "
                    "Analyze this medical image and provide a structured report.\n\n"
                    "Use exactly this format:\n"
                    "Findings:\n[describe what you observe]\n\n"
                    "Impression:\n[your clinical interpretation]\n\n"
                    "Recommendation:\n[suggested next steps]\n\n"
                    "Important: This is for clinical decision support only and does not replace specialist consultation."
                    f"{note}"
                )

                report_en = self._generate([{
                    "role": "user",
                    "content": [
                        {"type": "image", "image": img},
                        {"type": "text", "text": en_prompt},
                    ],
                }])

                tr_prompt = (
                    "Bu tıbbi raporu Türkçeye çevir. "
                    "Bölüm başlıklarını tam olarak şöyle yaz: Bulgular, Yorum, Öneri. "
                    "Tıbbi terimleri doğru ve eksiksiz çevir. "
                    "Rapor sonuna şunu ekle: Bu sistem klinik karar desteği amaçlıdır, tanı koymaz.\n\n"
                    f"{report_en}"
                )

                report_tr = self._generate([{
                    "role": "user",
                    "content": [{"type": "text", "text": tr_prompt}],
                }])

                return {"report_en": report_en, "report_tr": report_tr}

            except Exception as e:
                raise HTTPException(status_code=500, detail=f"Analiz hatası: {str(e)}")

        @web.post("/chat")
        async def chat(req: ChatReq, user=Depends(auth)):
            """
            MedGemma ile bağlamlı sohbet.
            Görüntü ilk kullanıcı mesajına eklenir, konuşma geçmişi korunur.
            """
            try:
                img = self._decode_image(req.image_base64)

                conversation = []
                for i, msg in enumerate(req.messages):
                    if msg.role == "user" and i == 0:
                        # İlk mesaja görüntüyü ekle
                        conversation.append({
                            "role": "user",
                            "content": [
                                {"type": "image", "image": img},
                                {"type": "text", "text": msg.content},
                            ],
                        })
                    else:
                        conversation.append({
                            "role": msg.role,
                            "content": [{"type": "text", "text": msg.content}],
                        })

                reply = self._generate(conversation, max_tokens=400)
                return {"reply": reply}

            except Exception as e:
                raise HTTPException(status_code=500, detail=f"Sohbet hatası: {str(e)}")

        return web
