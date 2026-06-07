import modal
import os
import base64
from io import BytesIO
from datetime import datetime, timedelta, timezone

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

        HOURLY_LIMIT = 10

        async def auth(creds: HTTPAuthorizationCredentials = Depends(bearer)):
            """Supabase JWT token'ını doğrular, kullanıcı bilgisi ve token'ı döner."""
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
            return {"user": r.json(), "token": creds.credentials}

        async def check_rate_limit(user_id: str, token: str):
            """Kullanıcının son 1 saatteki analiz sayısını kontrol eder."""
            one_hour_ago = (datetime.now(timezone.utc) - timedelta(hours=1)).isoformat()
            async with httpx.AsyncClient() as c:
                r = await c.get(
                    f"{SUPABASE_URL}/rest/v1/analyses",
                    headers={
                        "Authorization": f"Bearer {token}",
                        "apikey": SUPABASE_KEY,
                        "Prefer": "count=exact",
                        "Range": "0-0",
                    },
                    params={
                        "user_id": f"eq.{user_id}",
                        "created_at": f"gte.{one_hour_ago}",
                        "select": "id",
                    },
                )
            content_range = r.headers.get("Content-Range", "0/0")
            total = int(content_range.split("/")[-1]) if "/" in content_range else 0
            if total >= HOURLY_LIMIT:
                raise HTTPException(
                    status_code=429,
                    detail=f"Saatlik analiz limitine ulaştınız ({HOURLY_LIMIT}/saat). Lütfen bir saat sonra tekrar deneyin.",
                )

        class AnalyzeReq(BaseModel):
            images_base64: list[str] = []  # opsiyonel — görüntüsüz metin analizi de desteklenir
            doctor_note: str = ""

        class ChatMsg(BaseModel):
            role: str
            content: str

        class ChatReq(BaseModel):
            image_base64: str = ""        # opsiyonel — yoksa görüntüsüz sohbet
            messages: list[ChatMsg]
            attachment_base64: str = ""   # opsiyonel ek görüntü/belge

        @web.get("/health")
        async def health():
            return {"status": "ok", "model": "medgemma-4b-it"}

        @web.post("/analyze")
        async def analyze(req: AnalyzeReq, auth_data=Depends(auth)):
            """
            Tıbbi görüntüyü analiz eder.
            İngilizce kapsamlı rapor üretir, ardından Türkçeye çevirir.
            """
            try:
                user = auth_data["user"]
                await check_rate_limit(user["id"], auth_data["token"])

                images = [self._decode_image(b64) for b64 in req.images_base64]
                image_count = len(images)

                note_section = (
                    f"\n\nClinician-Provided History & Context:\n{req.doctor_note}"
                    if req.doctor_note else ""
                )

                if image_count > 0:
                    multi_note = (
                        f" {image_count} medical images have been provided; analyze them together as a combined study."
                        if image_count > 1 else ""
                    )

                    en_prompt = (
                        "You are a senior radiologist and clinician with subspecialty expertise. "
                        "You are producing a formal medical image analysis report for qualified medical professionals. "
                        "Use precise, peer-level clinical and radiological terminology throughout. "
                        "Be thorough, systematic, and specific — avoid vague or generic statements.\n\n"
                        "Analyze this medical image and produce a structured report in the following format:\n\n"

                        "Findings:\n"
                        "Perform a systematic, region-by-region analysis. For each identified structure and abnormality describe: "
                        "anatomical location, size and dimensions (with measurements where estimable), morphology, "
                        "margins (well-defined, ill-defined, spiculated, lobulated), density or signal characteristics "
                        "(hyperdense, hypodense, T1/T2 signal, echogenicity), distribution pattern, and relationship to "
                        "adjacent structures. Note image quality, technical adequacy, and visible artifacts. "
                        "Document all relevant normal findings alongside abnormal ones.\n\n"

                        "Impression:\n"
                        "Provide a prioritized clinical interpretation. For each significant finding, "
                        "state the most likely diagnosis followed by a ranked differential diagnosis with supporting "
                        "radiological evidence for each. Note acuity — clearly flag any findings that require urgent "
                        "or emergent clinical attention. Correlate findings with provided clinical history where applicable.\n\n"

                        "Recommendation:\n"
                        "Provide specific, actionable recommendations ranked by clinical priority:\n"
                        "- Additional imaging (modality, sequence, contrast, laterality) with clinical rationale\n"
                        "- Relevant laboratory or pathological investigations\n"
                        "- Specialist referral (specify subspecialty) with urgency level\n"
                        "- Follow-up imaging timeline with clinical triggers for earlier reassessment\n"
                        "- Any immediate clinical intervention if findings warrant it\n\n"

                        "Disclaimer: This report is generated by an AI system for clinical decision support only "
                        "and does not replace specialist evaluation or formal radiological reporting."
                        f"{multi_note}{note_section}"
                    )

                    content = [{"type": "image", "image": img} for img in images]
                    content.append({"type": "text", "text": en_prompt})
                else:
                    # Görüntüsüz mod: laboratuvar sonucu, doktor raporu, klinik not vb.
                    text_only_prompt = (
                        "You are a senior clinician and medical specialist. "
                        "You are reviewing patient clinical data for qualified medical professionals. "
                        "Use precise clinical terminology throughout.\n\n"
                        "Based on the provided clinical data, produce a structured clinical summary in the following format:\n\n"

                        "Findings:\n"
                        "Systematically summarize the key findings from the provided data. "
                        "For laboratory results: identify values outside reference ranges, note the degree of deviation, "
                        "and describe relevant patterns or trends. "
                        "For clinical notes or reports: extract the core findings, symptoms, and relevant history.\n\n"

                        "Impression:\n"
                        "Provide a prioritized clinical interpretation of the findings. "
                        "State the most likely clinical diagnosis or condition, followed by relevant differential diagnoses "
                        "with supporting evidence. Flag any findings that require urgent attention.\n\n"

                        "Recommendation:\n"
                        "Provide specific, actionable clinical recommendations:\n"
                        "- Further investigations (laboratory, imaging) with clinical rationale\n"
                        "- Specialist referral (specify subspecialty) with urgency level\n"
                        "- Treatment or management considerations\n"
                        "- Follow-up timeline\n\n"

                        "Disclaimer: This report is generated by an AI system for clinical decision support only "
                        "and does not replace specialist evaluation.\n\n"
                        f"Clinical Data:\n{req.doctor_note}"
                    )
                    content = [{"type": "text", "text": text_only_prompt}]

                report_en = self._generate([{
                    "role": "user",
                    "content": content,
                }], max_tokens=1400)

                tr_prompt = (
                    "Aşağıdaki tıbbi radyoloji raporunu eksiksiz ve tam olarak Türkçeye çevir. "
                    "Hedef okuyucu kitlesi uzman hekimler ve radyologlardır; bu nedenle tıbbi terminoloji "
                    "doğru ve eksiksiz çevrilmeli, hiçbir klinik ayrıntı atlanmamalıdır.\n\n"
                    "Bölüm başlıklarını tam olarak şu şekilde yaz:\n"
                    "Bulgular:\n"
                    "Yorum:\n"
                    "Öneri:\n\n"
                    "Radyolojik terimleri (örn. hiperdans, speküle kenar, T2 sinyal intensitesi) "
                    "Türkçe tıp literatüründe kabul görmüş karşılıklarıyla çevir. "
                    "Orijinal rapordaki tüm bulgular, ayırıcı tanılar ve öneriler eksiksiz aktarılmalıdır. "
                    "Çeviriye ek yorum veya açıklama ekleme.\n\n"
                    f"{report_en}"
                )

                report_tr = self._generate([{
                    "role": "user",
                    "content": [{"type": "text", "text": tr_prompt}],
                }], max_tokens=1400)

                return {"report_en": report_en, "report_tr": report_tr}

            except Exception as e:
                raise HTTPException(status_code=500, detail=f"Analiz hatası: {str(e)}")

        @web.post("/chat")
        async def chat(req: ChatReq, auth_data=Depends(auth)):
            """
            MedGemma ile bağlamlı sohbet.
            Görüntü ilk kullanıcı mesajına eklenir, konuşma geçmişi korunur.
            """
            try:
                img = self._decode_image(req.image_base64) if req.image_base64 else None

                attachment = (
                    self._decode_image(req.attachment_base64)
                    if req.attachment_base64 else None
                )

                conversation = []
                for i, msg in enumerate(req.messages):
                    is_last = i == len(req.messages) - 1
                    if msg.role == "user" and i == 0 and img:
                        # İlk mesaja orijinal görüntüyü ekle (varsa)
                        conversation.append({
                            "role": "user",
                            "content": [
                                {"type": "image", "image": img},
                                {"type": "text", "text": msg.content},
                            ],
                        })
                    elif msg.role == "user" and is_last and attachment:
                        # Son mesaja ek görüntüyü ekle
                        conversation.append({
                            "role": "user",
                            "content": [
                                {"type": "image", "image": attachment},
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
