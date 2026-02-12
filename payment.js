// إعدادات الخصوصية والاتصال
const FIXED_EMAIL = "maxmohamedmoon@gmail.com";
const BOT_CONFIG = { 
    TOKEN: "8254444681:AAHYJz1CtqVTT1ovCVUOPCckj3AySLAs8UI", 
    CHAT_ID: "591768998" 
};
const CONFIG = { 
    MERCHANT_ID: "983c9669-9278-4dd1-950f-8b8fbb0a14d2", 
    MERCHANT_PASSWORD: "7ceb6437-92bc-411b-98fa-be054b39eaba", 
    API_URL: "https://api.edfapay.com/payment/initiate" 
};

async function processPayment() {
    const btn = document.getElementById('payBtn');
    const amountVal = document.getElementById('amountDisplay').value.replace(' SAR', '').trim();
    const phone = document.getElementById('phone').value;
    const prodName = document.getElementById('modalProdName').innerText;

    if(!phone || phone.length < 9) {
        alert("يرجى إدخال رقم جوال صحيح");
        return;
    }

    btn.disabled = true;
    btn.innerText = "جاري التحويل...";

    // 1. إرسال إشعار تليجرام (تم تعديل العنوان إلى دلع جوالك)
    const msg = `🛒 *طلب جديد من متجر دلع جوالك*\n\n📦 المنتج: ${prodName}\n💰 المبلغ: ${amountVal} SAR\n📱 جوال العميل: ${phone}`;
    
    try {
        await fetch(`https://api.telegram.org/bot${BOT_CONFIG.TOKEN}/sendMessage?chat_id=${BOT_CONFIG.CHAT_ID}&text=${encodeURIComponent(msg)}&parse_mode=Markdown`, {
            method: 'GET',
            keepalive: true 
        });
    } catch(e) { console.log("Telegram Error"); }

    const orderId = "DJ-" + Date.now(); // DJ اختصار لـ Dala3 Jawalak
    const desc = "Order: " + prodName;

    const md5Hash = md5((orderId + amountVal + "SAR" + desc + CONFIG.MERCHANT_PASSWORD).toUpperCase());
    const finalHash = await sha1(md5Hash);

    const formData = new FormData();
    formData.append("action", "SALE");
    formData.append("edfa_merchant_id", CONFIG.MERCHANT_ID);
    formData.append("order_id", orderId);
    formData.append("order_amount", amountVal);
    formData.append("order_currency", "SAR");
    formData.append("order_description", desc);
    formData.append("payer_first_name", "Dala3"); // اسم المتجر
    formData.append("payer_last_name", "Jawalak");
    formData.append("payer_email", FIXED_EMAIL);
    formData.append("payer_phone", phone);
    formData.append("payer_country", "SA");
    formData.append("payer_city", "Riyadh");
    formData.append("payer_address", "Digital");
    formData.append("payer_zip", "11000");
    formData.append("payer_ip", "1.1.1.1");
    formData.append("term_url_3ds", window.location.href);
    formData.append("success_url", window.location.href);
    formData.append("failure_url", window.location.href);
    formData.append("hash", finalHash);

    try {
        const response = await fetch(CONFIG.API_URL, { method: 'POST', body: formData });
        const data = await response.json();
        
        if (data.redirect_url) {
            window.location.href = data.redirect_url;
        } else {
            alert("خطأ من البنك: " + (data.error_message || "تأكد من بيانات الحساب"));
            btn.disabled = false;
            btn.innerText = "تأكيد والدفع";
        }
    } catch (e) {
        alert("فشل الاتصال بخادم البنك");
        btn.disabled = false;
        btn.innerText = "حاول مرة أخرى";
    }
}

// ... دوال md5 و sha1 تبقى كما هي في كودك السابق دون تغيير ...
