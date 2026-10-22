// Google Analytics 4. Pegar el ID de medición (G-XXXXXXX) acá:
var GA_ID = 'G-189BB55KW5';
(function(){
  if(!GA_ID) return;
  var s=document.createElement('script');s.async=true;s.src='https://www.googletagmanager.com/gtag/js?id='+GA_ID;document.head.appendChild(s);
  window.dataLayer=window.dataLayer||[];window.gtag=function(){dataLayer.push(arguments)};
  gtag('js',new Date());gtag('config',GA_ID,{send_page_view:true});
  var last=location.pathname;
  window.gaPage=function(p){if(p===last)return;last=p;gtag('event','page_view',{page_path:p,page_location:location.origin+p,page_title:document.title})};
  document.addEventListener('click',function(e){var a=e.target.closest&&e.target.closest('a');if(!a)return;var h=a.getAttribute('href')||'';
    if(h.indexOf('wa.me')>-1)gtag('event','contact_whatsapp');else if(h.indexOf('mailto:')===0)gtag('event','contact_email');else if(h.indexOf('tel:')===0)gtag('event','contact_phone');},true);
  document.addEventListener('submit',function(e){var f=e.target;gtag('event','generate_lead',{form_id:f.id||f.className||'form'})},true);
})();
