# خطوات التعديلات والتحسينات المطلوبة

مراجعة شاملة للمشروع — نقاط تحتاج تعديل أو تحسين.

---

## 1. أمان (Security)

### 1.1 JWT Secret في الإنتاج
- **الملف:** `src/lib/auth.ts`
- **المشكلة:** وجود قيمة افتراضية `'fallback-secret-change-in-production'` عند عدم وجود `JWT_SECRET`.
- **الإجراء:** في الإنتاج إما رفض التشغيل إذا لم يُعرّف `JWT_SECRET`، أو رمي خطأ واضح بدل استخدام الـ fallback.
```ts
const JWT_SECRET = process.env.JWT_SECRET;
if (!JWT_SECRET && process.env.NODE_ENV === 'production') {
  throw new Error('JWT_SECRET must be set in production');
}
const secret = JWT_SECRET || 'fallback-secret-change-in-production';
```

### 1.2 توثيق متغيرات البيئة
- **الملف:** `.env.example`
- **الإجراء:** إضافة تعليق يوضح أن `JWT_SECRET` يجب أن يكون عشوائياً وقوياً (مثلاً 32+ حرف)، وعدم استخدام القيمة الافتراضية في الإنتاج.

---

## 2. حماية المسارات (Route Protection)

### 2.1 تفعيل الـ Proxy / Middleware
- **الوضع الحالي:** يوجد `src/proxy.ts` ويصدّر دالة `proxy` و`config`. في **Next.js 16** الملف المعتمد هو `proxy.ts` (بديل عن `middleware.ts`).
- **الإجراء:** التأكد من أن المشروع يعمل على Next.js 16 وأن حماية المسارات تعمل (مثلاً زيارة `/dashboard` بدون تسجيل دخول تعيد التوجيه إلى `/login`). إن كنت على إصدار أقدم من 16، أنشئ `middleware.ts` في الجذر أو داخل `src` وصدّر الدالة باسم `middleware` مع نفس منطق `proxy.ts`.

---

## 3. تجربة المستخدم والواجهة (UX / UI)

### 3.1 زر الإعدادات في الهيدر
- **الملف:** `src/components/layout/header.tsx`
- **المشكلة:** عنصر "Settings" في القائمة المنسدلة بدون `href` أو سلوك عند النقر.
- **الإجراء:** إما ربطه بمسار (مثل `/settings`) أو إزالته حتى يكون هناك صفحة إعدادات حقيقية.

### 3.2 تسجيل الخروج في الهيدر
- **الملف:** `src/components/layout/header.tsx`
- **المشكلة:** `handleLogout` يستدعي الـ API مباشرة ولا يستخدم `useLogout`، فلا يتم إبطال الـ cache (مثل `queryClient.clear()`) كما في صفحة Login.
- **الإجراء:** استخدام `useLogout()` من `@/hooks/use-auth` واستدعاء `mutate()` بدل تنفيذ الـ fetch يدوياً؛ لضمان تناسق السلوك مع باقي التطبيق.

### 3.3 لغة وسمت الصفحة الرئيسية
- **الملف:** `src/app/layout.tsx`
- **الملاحظة:** `lang="en"` مناسب إذا كانت الواجهة إنجليزية. إذا كان جزء من النصوص عربياً، يمكن إبقاء `lang="en"` وإضافة `dir="auto"` عند الحاجة أو استخدام `lang="ar"` للصفحات العربية.

---

## 4. جودة الكود (Code Quality)

### 4.1 نوع المرشّح في الداشبورد
- **الملف:** `src/app/dashboard/page.tsx`
- **المشكلة:** `handleAction = (candidate: any)` — استخدام `any` يقلل من فائدة TypeScript.
- **الإجراء:** استيراد نوع `Candidate` من خدمة أو من ملف أنواع مشترك واستخدامه:
```ts
import type { Candidate } from '@/types/candidate'; // أو من مصدرك
const handleAction = useCallback((candidate: Candidate) => { ... }, []);
```

### 4.2 أنواع مرشحي التوظيف مكررة
- **الملفات:** `src/components/dashboard/candidate-modal.tsx`, `src/components/dashboard/candidates-table.tsx`
- **المشكلة:** واجهة `Candidate` (وما يرتبط بها) معرّفة في أكثر من مكان.
- **الإجراء:** إنشاء ملف أنواع مشترك (مثل `src/types/candidate.ts`) وتصدير واجهات `Candidate`, `CallFeedback` واستيرادها في المودال والجدول.

### 4.3 تبعيات الـ Hook في useSubmitFeedback
- **الملف:** `src/hooks/use-submit-feedback.ts`
- **الملاحظة:** إدراج `toast` و`isSubmitting` في مصفوفة التبعيات قد يغيّر مرجع `submitFeedback` في كل render إذا تغيرت `toast`.
- **الإجراء:** (اختياري) استخدام `useRef` لمنع الإرسال المزدوج بدل الاعتماد على `isSubmitting` في التبعيات، أو التأكد من أن `useToast()` يعيد مرجعاً ثابتاً.

---

## 5. إمكانية الوصول (Accessibility)

### 5.1 حقل البحث في الفلتر
- **الملف:** `src/components/dashboard/filter-bar.tsx`
- **الإجراء:** إضافة `aria-label` (أو ربط `Label` مرئي) لحقل البحث، مثلاً: `aria-label="Search by phone number"` أو `id` + `<Label htmlFor="search">`.

### 5.2 تنقل الترقيم (Pagination)
- **الملف:** `src/components/dashboard/pagination.tsx`
- **الإجراء:** لف أزرار الترقيم في `<nav aria-label="Candidates pagination">` وإضافة `aria-current="page"` للصفحة الحالية.

---

## 6. قاعدة البيانات والـ API

### 6.1 PATCH مرشح واحد
- **الملف:** `src/app/api/candidates/[id]/route.ts`
- **الملاحظة:** عند إرسال `status` و`currentlyViewingBy` معاً، يتم تنفيذ التحديثات بشكل متتابع وقد تُستبدل `updatedCandidate` أكثر من مرة.
- **الإجراء:** (اختياري) دمج التحديثات في استدعاء `update` واحد عندما يكون ذلك ممكناً، لتفادي قراءة/كتابة متعددة غير ضرورية.

### 6.2 سجلات Prisma في التطوير
- **الملف:** `src/lib/prisma.ts`
- **الوضع الحالي:** `log: ['query', 'error', 'warn']` في التطوير قد ينتج الكثير من السجلات.
- **الإجراء:** (اختياري) تقليل السجل إلى `['error', 'warn']` إلا إذا كنت تحتاج تتبع الاستعلامات للتشخيص.

---

## 7. تحسينات اختيارية (Optional)

### 7.1 تحديث "يعرضه الآن" عند إغلاق التبويب
- **الملف:** `src/app/dashboard/page.tsx`
- **الملاحظة:** عند إغلاق المودال يتم إرسال `currentlyViewingBy: null` في الـ cleanup. إذا أغلق المستخدم التبويب دون إغلاق المودال، يبقى المرشح مرتبطاً بالمستخدم.
- **الإجراء:** (اختياري) استخدام `visibilitychange` أو `beforeunload` لإرسال طلب يمسح `currentlyViewingBy` عند مغادرة الصفحة، أو الاعتماد على انتهاء صلاحية الجلسة لاحقاً.

### 7.2 تحسين صور Next.js
- **الملف:** `next.config.ts`
- **الوضع الحالي:** `remotePatterns` يسمح بـ `hostname: '**'`.
- **الإجراء:** في الإنتاج تقييد النطاقات المعروفة لمصادر الصور (مثل نطاق التخزين السحابي أو CDN) بدل السماح لجميع النطاقات.

---

## ملخص أولويات التنفيذ

| الأولوية | البند                    | الجهد تقريباً |
|----------|---------------------------|----------------|
| عالية    | 1.1 JWT Secret            | قليل          |
| عالية    | 2.1 تفعيل Middleware      | قليل          |
| متوسطة   | 3.1 زر Settings            | قليل          |
| متوسطة   | 3.2 تسجيل الخروج الموحد   | قليل          |
| متوسطة   | 4.1 نوع `candidate`        | قليل          |
| متوسطة   | 4.2 أنواع مشتركة          | متوسط         |
| منخفضة   | 5.1 و 5.2 إمكانية الوصول  | قليل          |
| منخفضة   | 6.1 و 6.2 و 7.x            | حسب الحاجة    |

يمكن البدء بالبنود عالية الأولوية ثم المتوسطة، ثم تحسينات الإنتاج والـ a11y عند الاستعداد للنشر.
