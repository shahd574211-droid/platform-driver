# ربط بوت الواتساب بالمنصة (أرقام الكابتن)

## كيف تظهر أرقام الكابتن في البلاتفورم

1. **بوت الواتساب** يرسل طلب `POST` إلى ويب هوك المنصة عند تسجيل كابتن جديد.
2. **الويب هوك** يحفظ البيانات في جدول المرشحين (Candidates) ويُضيف رقم الكابتن إن وُجد.
3. **الداشبورد** يحدّث البيانات تلقائياً كل 30 ثانية، فتظهر السجلات الجديدة (بما فيها رقم الكابتن) في الجدول.

---

## إعداد المنصة

### 1. إضافة مفتاح الويب هوك في `.env`

```env
WEBHOOK_SECRET=اختر_كلمة_سر_قوية_للبوت
```

(أو استخدم تسجيل دخول مستخدم مع `Authorization: Bearer <JWT>` بدلاً من المفتاح.)

### 2. تطبيق تغييرات قاعدة البيانات (عمود رقم الكابتن)

```bash
npm run db:push
```

---

## إعداد البوت ليرسل للويب هوك

### عنوان الويب هوك

```
POST https://your-domain.com/api/webhook/whatsapp
```

(في التطوير المحلي: `http://localhost:3000/api/webhook/whatsapp` مع تعريض المنفذ إذا لزم.)

### المصادقة (أحد الخيارين)

**الخيار 1 – مفتاح سري (مُنصح للبوت)**

- Header:
  - `X-Webhook-Secret: <قيمة WEBHOOK_SECRET من .env>`

**الخيار 2 – توكن المستخدم**

- Header:
  - `Authorization: Bearer <JWT للمستخدم>`

### جسم الطلب (JSON)

| الحقل | مطلوب | الوصف |
|-------|--------|--------|
| `whatsapp_phone_number` | نعم | رقم واتساب الكابتن |
| `captain_number` | لا | رقم الكابتن (معرّف من البوت أو النظام) |
| `city_name` | نعم | المدينة |
| `nid_front_url` | لا | رابط صورة الهوية (أمامي) |
| `nid_back_url` | لا | رابط صورة الهوية (خلفي) |
| `driver_license_url` | لا | رابط رخصة القيادة |
| `selfie_url` | لا | رابط السيلفي |
| `verification_video_url` | لا | رابط فيديو التحقق |
| `car_status` | لا | حالة السيارة |
| `car_model` | لا | موديل السيارة |
| `car_year` | لا | سنة السيارة |

### مثال طلب من البوت

```bash
curl -X POST https://your-domain.com/api/webhook/whatsapp \
  -H "Content-Type: application/json" \
  -H "X-Webhook-Secret: your-webhook-secret" \
  -d '{
    "whatsapp_phone_number": "+9647712345678",
    "captain_number": "CAP-001",
    "city_name": "بغداد"
  }'
```

### مثال من كود (Node / بوت واتساب)

```javascript
const response = await fetch('https://your-domain.com/api/webhook/whatsapp', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    'X-Webhook-Secret': process.env.WEBHOOK_SECRET,
  },
  body: JSON.stringify({
    whatsapp_phone_number: '+9647712345678',
    captain_number: 'CAP-001',
    city_name: 'بغداد',
  }),
});
```

---

## أين تظهر أرقام الكابتن في البلاتفورم

- **جدول المرشحين (الداشبورد):** عمود **"Captain #"** بجانب رقم الهاتف والمدينة.
- **نافذة تفاصيل المرشح:** قسم التفاصيل يعرض **"رقم الكابتن"** إذا كان الحقل مُعبّأ.

بعد إرسال البوت للويب هوك، السجل الجديد (مع رقم الكابتن) يظهر في الجدول خلال التحديث التلقائي (خلال 30 ثانية أو بعد تحديث الصفحة).
