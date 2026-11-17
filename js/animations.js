/* ========== الفوتر + زر المشاركة الدائري لكل منتج (Radial Share) + بصمة المطور Poinr ========== */
(() => {
  const $ = (sel, root = document) => root.querySelector(sel);
  const html = document.documentElement;

  /* ---------- كود زر المشاركة الدائري (8 منصات) ---------- */
  const SHARE_BUTTON_HTML = `
    <div class="share-radial" id="modalShareRadial" aria-label="Share dish">
      <button class="main-button" id="shareMainBtn" type="button" aria-label="Share">
        <svg width="19" height="19" fill="currentColor" viewBox="0 0 24 24"><path d="M15.75 5.125a3.125 3.125 0 1 1 .754 2.035l-8.397 3.9a3.124 3.124 0 0 1 0 1.88l8.397 3.9a3.125 3.125 0 1 1-.61 1.095l-8.397-3.9a3.125 3.125 0 1 1 0-4.07l8.397-3.9a3.125 3.125 0 0 1-.144-.94Z"></path></svg>
      </button>
      <button class="discord-button button" type="button" data-plat="discord" style="transition-delay:0s" aria-label="Discord"><svg viewBox="0 0 24 24" fill="currentColor" height="16" width="16"><path d="M18.65 6.37a15.87 15.87 0 0 0-3.91-1.21.06.06 0 0 0-.06.03c-.17.3-.36.69-.49 1a14.63 14.63 0 0 0-4.39 0 9.91 9.91 0 0 0-.49-1 .06.06 0 0 0-.06-.03c-1.35.23-2.66.64-3.91 1.21a.05.05 0 0 0-.03.02C2.83 10.11 2.15 13.74 2.48 17.32a.07.07 0 0 0 .03.05 15.94 15.94 0 0 0 4.79 2.42.06.06 0 0 0 .07-.02c.37-.5.7-1.04.98-1.6a.06.06 0 0 0-.03-.08 10.65 10.65 0 0 1-1.5-.71.06.06 0 0 1-.01-.1c.1-.08.2-.16.3-.23a.06.06 0 0 1 .06-.01c3.14 1.44 6.55 1.44 9.65 0a.06.06 0 0 1 .06.01c.1.08.2.16.3.23a.06.06 0 0 1-.01.1c-.48.28-.98.52-1.5.71a.06.06 0 0 0-.03.09c.29.56.62 1.09.98 1.6a.06.06 0 0 0 .07.02 15.89 15.89 0 0 0 4.8-2.42.06.06 0 0 0 .03-.05c.4-4.14-.67-7.74-2.84-10.93a.04.04 0 0 0-.02-.02Zm-9.84 8.77c-.95 0-1.73-.87-1.73-1.94s.77-1.94 1.73-1.94c.97 0 1.74.88 1.73 1.94 0 1.07-.77 1.94-1.73 1.94Zm6.38 0c-.95 0-1.73-.87-1.73-1.94s.76-1.94 1.73-1.94c.97 0 1.74.88 1.73 1.94 0 1.07-.76 1.94-1.73 1.94Z"></path></svg></button>
      <button class="twitter-button button" type="button" data-plat="twitter" style="transition-delay:0.04s" aria-label="X Twitter"><svg viewBox="0 0 24 24" fill="currentColor" height="16" width="16"><path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"></path></svg></button>
      <button class="reddit-button button" type="button" data-plat="reddit" style="transition-delay:0.08s" aria-label="Reddit"><svg width="16" height="16" fill="currentColor" viewBox="0 0 24 24"><path d="M22 12a10 10 0 1 1-20 0 10 10 0 0 1 20 0Zm-4.79-1.46c-.39 0-.75.16-1.02.41-1-.72-2.38-1.18-3.9-1.24l.67-3.13 2.17.47a1.04 1.04 0 1 0 1.04-1.09 1.04 1.04 0 0 0-.93.59l-2.42-.51a.25.25 0 0 0-.3.2l-.74 3.49c-1.55.05-2.95.51-3.96 1.24a1.47 1.47 0 0 0-1.93-.08 1.45 1.45 0 0 0 .32 2.46c-.02.15-.04.29-.04.44 0 2.24 2.61 4.07 5.84 4.07s5.84-1.81 5.84-4.07c0-.15-.01-.29-.04-.44.5-.23.86-.74.86-1.34 0-.81-.66-1.46-1.46-1.46Z"></path></svg></button>
      <button class="messenger-button button" type="button" data-plat="messenger" style="transition-delay:0.12s" aria-label="Messenger"><svg width="16" height="16" fill="currentColor" viewBox="0 0 24 24"><path d="M2 11.7C2 6.13 6.37 2 12 2s10 4.13 10 9.7-4.37 9.7-10 9.7c-1.01 0-1.98-.13-2.9-.38a.8.8 0 0 0-.53.04l-1.99.88a.8.8 0 0 1-1.12-.71l-.06-1.78a.8.8 0 0 0-.27-.57C3.2 17.14 2 14.62 2 11.7Zm6.93-1.82-2.94 4.66c-.28.45.27.95.69.63l3.16-2.4a.6.6 0 0 1 .72 0l2.34 1.75a1.5 1.5 0 0 0 2.17-.4l2.94-4.66c.28-.45-.27-.95-.69-.63l-3.16 2.4a.6.6 0 0 1-.72 0l-2.34-1.75a1.5 1.5 0 0 0-2.17.4Z"></path></svg></button>
      <button class="pinterest-button button" type="button" data-plat="pinterest" style="transition-delay:0.16s" aria-label="Pinterest"><svg viewBox="0 0 24 24" fill="currentColor" height="16" width="16"><path d="M12.48 2.4a9.6 9.6 0 0 0-3.5 18.54c-.08-.76-.16-1.93.03-2.76.18-.75 1.13-4.77 1.13-4.77s-.29-.58-.29-1.42c0-1.34.77-2.33 1.74-2.33.82 0 1.21.61 1.21 1.35 0 .82-.52 2.06-.8 3.2-.23.96.48 1.74 1.42 1.74 1.71 0 3.02-1.8 3.02-4.4 0-2.3-1.65-3.9-4.01-3.9-2.73 0-4.34 2.05-4.34 4.17 0 .83.32 1.71.71 2.19.08.1.09.18.07.28-.07.3-.24.96-.27 1.09-.04.18-.14.21-.32.13-1.2-.56-1.95-2.31-1.95-3.72 0-3.03 2.2-5.81 6.34-5.81 3.33 0 5.92 2.37 5.92 5.54 0 3.31-2.09 5.97-4.98 5.97-.97 0-1.89-.51-2.2-1.1l-.6 2.28c-.22.83-.8 1.88-1.19 2.52A9.6 9.6 0 1 0 12.48 2.4Z"></path></svg></button>
      <button class="instagram-button button" type="button" data-plat="instagram" style="transition-delay:0.2s" aria-label="Instagram"><svg width="16" height="16" fill="currentColor" viewBox="0 0 24 24"><path d="M12 2c-2.71 0-3.06.01-4.12.06-1.07.05-1.79.22-2.43.47a4.9 4.9 0 0 0-2.92 2.92c-.25.64-.42 1.36-.47 2.43C2.01 8.94 2 9.28 2 12s.01 3.06.06 4.12c.05 1.07.22 1.79.47 2.43a4.9 4.9 0 0 0 2.92 2.92c.64.25 1.36.42 2.43.47 1.07.05 1.41.06 4.12.06s3.06-.01 4.12-.06c1.07-.05 1.79-.22 2.43-.47a4.9 4.9 0 0 0 2.92-2.92c.25-.64.42-1.36.47-2.43.05-1.07.06-1.41.06-4.12s-.01-3.06-.06-4.12c-.05-1.07-.22-1.79-.47-2.43a4.9 4.9 0 0 0-2.92-2.92c-.64-.25-1.36-.42-2.43-.47C15.06 2.01 14.72 2 12 2Zm0 4.87a5.14 5.14 0 1 0-.16 10.27A5.14 5.14 0 0 0 12 6.87Zm0 1.8a3.33 3.33 0 1 1 0 6.67 3.33 3.33 0 0 1 0-6.67Z"></path></svg></button>
      <button class="snapchat-button button" type="button" data-plat="snapchat" style="transition-delay:0.24s" aria-label="Snapchat"><svg viewBox="0 0 24 24" fill="currentColor" height="16" width="16"><path d="M21.93 16.41c-.14-.38-.4-.58-.71-.75l-.43-.22c-.94-.5-1.67-1.13-2.18-1.87a4.23 4.23 0 0 1-.38-.66c-.04-.13-.04-.2-.01-.26l.56-.41c.55-.36.95-.69 1.29-1.18a1.75 1.75 0 0 0 .09-1.45c-.26-.67-.89-1.09-1.66-1.09-.21 0-.41.03-.61.08.01-.46 0-.95-.04-1.42-.15-1.68-.73-2.56-1.35-3.26A5.37 5.37 0 0 0 15.14 2.8C14.2 2.27 13.15 2 12 2s-2.2.27-3.13.8a5.38 5.38 0 0 0-1.37 1.1c-.61.7-1.2 1.58-1.35 3.26-.04.48-.05.97-.05 1.42-.2-.05-.4-.08-.61-.08-.77 0-1.4.42-1.66 1.09a1.75 1.75 0 0 0 .08 1.45c.34.5.74.83 1.29 1.18l.56.41c.03.07.03.14-.02.27-.5.73-1.21 1.35-2.12 1.84-.48.26-.98.43-1.19 1-.16.44-.06.93.35 1.34.45.45 1.1.7 1.76.89.15.13.13.33.32.61.41.29.88.3 1.37.32.44.02.95.04 1.52.23.93.49 1.87 1.41 3.98 1.41s3.06-.92 3.98-1.41c.58-.19 1.08-.21 1.52-.23.49-.02.96-.04 1.37-.32.2-.22.25-.45.42-.69.66-.19 1.31-.44 1.76-.89.38-.41.48-.89.32-1.31Z"></path></svg></button>
      <button class="whatsapp-button button" type="button" data-plat="whatsapp" style="transition-delay:0.28s" aria-label="WhatsApp"><svg viewBox="0 0 24 24" fill="currentColor" height="16" width="16"><path d="M19 4.91A9.82 9.82 0 0 0 11.99 2C6.53 2 2.09 6.45 2.08 11.91c0 1.75.46 3.45 1.32 4.96L2 22l5.26-1.38a9.92 9.92 0 0 0 4.74 1.21h.01c5.46 0 9.91-4.45 9.91-9.91A9.87 9.87 0 0 0 19 4.91ZM11.99 20.15A8.22 8.22 0 0 1 7.8 19l-.3-.18-3.12.82.83-3.04-.2-.31a8.2 8.2 0 0 1-1.26-4.38c0-4.53 3.7-8.23 8.24-8.23a8.2 8.2 0 0 1 8.24 8.24c-.01 4.55-3.7 8.24-8.24 8.24Z"></path></svg></button>
    </div>`;

  /* ---------- تركيب زر المشاركة الدائري داخل نافذة تفاصيل المنتج ---------- */
  function setupShareWidget() {
    const modalMedia = $("#modalMedia");
    if (!modalMedia || $("#modalShareRadial")) return;

    modalMedia.insertAdjacentHTML("beforeend", SHARE_BUTTON_HTML);

    let toast = $("#shareToast");
    if (!toast) {
      toast = document.createElement("div");
      toast.id = "shareToast";
      toast.className = "share-toast";
      document.body.appendChild(toast);
    }

    const radial = $("#modalShareRadial");
    const mainBtn = $("#shareMainBtn");

    function showToast(msg) {
      toast.textContent = msg;
      toast.classList.add("is-shown");
      clearTimeout(toast._t);
      toast._t = setTimeout(() => toast.classList.remove("is-shown"), 2400);
    }

    mainBtn.addEventListener("click", (e) => {
      e.stopPropagation();
      radial.classList.toggle("is-open");
    });

    radial.addEventListener("click", (e) => {
      const btn = e.target.closest(".button[data-plat]");
      if (!btn) return;
      e.stopPropagation();

      const plat = btn.dataset.plat;
      const dishName = $("#modalTitle")?.textContent || "TAZA 041";
      const dishPrice = $("#modalPrice")?.textContent || "";
      const url = window.location.href;
      const isAr = html.lang !== "en";
      const text = isAr
        ? `شوف هالوجبة الرهيبة من مطعم تازة 041 🍔🔥: ${dishName} (${dishPrice})`
        : `Check out this dish from TAZA 041 🍔🔥: ${dishName} (${dishPrice})`;
      const fullText = `${text}\n${url}`;

      if (plat === "whatsapp") {
        window.open(`https://wa.me/?text=${encodeURIComponent(fullText)}`, "_blank");
      } else if (plat === "twitter") {
        window.open(`https://twitter.com/intent/tweet?text=${encodeURIComponent(text)}&url=${encodeURIComponent(url)}`, "_blank");
      } else if (plat === "reddit") {
        window.open(`https://www.reddit.com/submit?url=${encodeURIComponent(url)}&title=${encodeURIComponent(text)}`, "_blank");
      } else if (plat === "pinterest") {
        window.open(`https://pinterest.com/pin/create/button/?url=${encodeURIComponent(url)}&description=${encodeURIComponent(text)}`, "_blank");
      } else {
        navigator.clipboard?.writeText(fullText).catch(() => {});
        showToast(isAr ? "تم نسخ تفاصيل الوجبة للمشاركة! ✨" : "Dish details copied to share! ✨");
      }
      radial.classList.remove("is-open");
    });

    document.addEventListener("click", () => radial.classList.remove("is-open"));
  }

  /* ---------- مسارات شعار المطور Poinr SVG (مضغوطة بدقة عالية) ---------- */
  const POINR_SVG = `
    <svg viewBox="0 0 1024 528" class="poinr-logo" aria-hidden="true">
      <path d="M443.9,414.8C437.9,431.3,432.1,447.4,426.2,463.5C425.6,465.2,425,467,424.2,468.6C422.6,471.7,420.1,473.8,416.5,472.4C412.9,470.9,412.2,467.9,413.3,464.1C417,452.4,420.2,440.6,423.9,428.9C431.3,405.7,438.7,382.4,448.4,360C450.4,355.3,452.3,350.5,455.4,346.3C457.9,342.9,460.6,339.9,465.2,340.7C470,341.6,473.4,344.5,474.8,349.2C477.1,356.7,477.3,364.6,478.2,372.4C479.5,382.9,480.2,393.5,482.4,404.4C489.2,392.8,491.3,379.8,496.1,367.9C501.8,353.9,505.6,339.2,512.7,325.8C514.4,322.5,516.2,319.3,519.5,317.3C526.7,312.9,534.5,316.4,535.2,324.9C536.5,339.3,537.2,353.8,538.3,368.2C539.7,386.3,540.7,404.4,545.4,422.8C551.3,410,556.6,397.8,562.5,385.8C573.9,362.8,588.6,342.2,605.3,322.8C626.4,298.1,650.5,276.7,676,256.7C684.7,249.9,693.5,242.9,702.9,236.9C706.7,234.4,710.1,231.1,713.3,227.4C709,228.5,704.6,229.5,700.2,230.7C622.1,251.3,544.6,274,467.5,298.2C411.6,315.7,355.8,333.7,300.5,353.2C290.3,356.9,280.3,360.9,270,364.4C265.9,365.8,265,368.2,265.2,372.2C267.3,403.5,269.1,434.7,271.1,465.9C271.5,471.2,270.9,475.9,265.8,478.9C259.5,482.4,252,479,250.8,471.9C248,454.6,245.3,437.2,242.5,419.9C240.4,407.1,238.1,394.4,235.9,381.6C235.7,380.5,235.1,379.5,234.7,378.5C232.5,377.8,230.9,379.1,229.3,379.8C214.1,386.5,198.8,392.9,183.5,399.5C170.8,405.1,157.5,409.6,144.2,413.6C128.5,418.3,113.9,425.4,98.6,431C83.4,436.5,68.4,442.3,53.2,447.9C50.7,448.8,48.1,449.6,45.5,449.8C41.5,450.1,37.5,449.3,35.5,445.5C33.3,441.4,33.5,437,36.7,433.3C39.7,429.9,43.2,427.1,47.4,425.2C61.6,418.5,76.7,414.1,91.7,409.8C118,402.1,143.3,392,168.9,382.4C188.3,375,207.7,367.4,227.2,360C230.5,358.8,231.7,357.4,231.2,353.5C228.4,334.2,223.5,315.4,219.3,296.5C212.4,264.8,202.3,234.1,191.1,203.8C189.8,200.2,188.9,196.5,187.7,192.9C186.6,189.3,187.8,186.5,190.7,184.6C193.9,182.5,196.5,184.6,198.4,187.1C204.4,195.2,207.8,204.6,211.6,213.9C223.1,242.5,233.1,271.6,240.7,301.6C240.7,295.3,242.1,288.5,240.3,282.7C238.4,276.5,239.4,271.4,240.1,265.4C241.1,257.1,240.9,248.4,240.6,240C240,221.1,241.6,202.3,242.9,183.6C244.1,167.2,245.9,150.8,250.7,135C253.5,126,257.9,117.9,265,111.4C278.4,99.2,295.2,100.7,306.3,115.2C313.8,125.1,317.1,136.6,318.9,148.5C322.3,171.5,321.8,194.5,315.1,216.8C309,237.2,299.8,256.3,282.7,270.3C277.1,274.9,271.3,279,264.2,280.8C261.2,281.6,260.1,283.1,260.2,286.1C261,304.2,261.6,322.4,262.3,340.5C262.5,345.4,266.1,344,268.5,343.1C274.7,340.7,280.7,337.8,286.9,335.3C319.4,322.4,351.4,308.5,383.7,295.1C417.3,281.2,451,267.8,484.5,253.8C500.7,247,517.4,241.1,533.8,234.7C558.5,225,583,215.2,607.7,205.6C626,198.5,644.4,191.7,662.8,184.7C707.2,167.9,751.9,151.9,796.7,136.4C846.3,119.2,896.2,103.3,947.1,90.4C960.2,87,973.4,84.3,986.5,81.3C988.9,80.7,991.3,80,993.3,82.2C992.5,85.5,989.8,86,987.6,87C968.5,95.2,948.6,101.4,929,108.4C875.6,127.2,822,145.4,768.7,164.6C707.9,186.5,647.4,209.3,587.2,232.8C552.7,246.3,518.2,260,483.3,273.8C485.3,274.3,486.5,273.3,487.9,272.8C515,264.8,542.1,256.6,569.3,248.7C597.2,240.5,625.2,232.1,653.3,224.5C687,215.3,720.7,206,754.7,198C760.4,196.7,766.1,195.4,771.8,194.3C777.6,193.2,782.7,196,784.4,200.9C785.9,205.2,783.7,210.3,778.6,212.9C761.2,221.9,743.6,230.8,727.2,241.6C679.6,273.1,636.5,309.5,602.2,355.5C583.7,380.4,571,408.1,561.4,437.4C559.4,443.4,557.4,449.4,555.2,455.4C553.3,460.5,550.1,464.7,544.2,464.9C538.3,465,534.9,461.1,532.8,455.9C529.2,447.1,528.4,437.5,526.8,428.2C524.6,414.9,523,401.6,521.2,388.3C520.8,385.3,520.3,382.2,520.7,379.3C521.5,373.3,520,367.7,518.2,361.7C511.1,376.6,507.4,392.4,502.3,407.7C498.7,418.2,495.5,428.9,492.1,439.5C491.8,440.5,491.5,441.4,491,442.3C488.5,447.3,485.5,451.7,479.1,451.5C474,451.3,470.2,447.5,468.4,440.6C465.9,431.1,465.5,421.3,463.9,411.7C462,400.8,464.3,389.3,458.8,378.1C453.8,390.5,448.9,402.5,443.9,414.8M262.5,179.9C260.5,205.9,259.7,231.8,260.1,257.8C260.1,262.7,261.5,263.5,265.7,261.4C266.7,260.8,267.6,260,268.5,259.3C283.1,247.8,290.9,231.8,296.4,214.7C302.9,194.2,302.1,173,299.8,151.9C298.9,143.9,297.3,135.9,293,128.7C288.2,120.4,281.5,119.8,275.7,127.3C271.8,132.2,269.7,138,268.2,144.1C265.2,155.5,263.7,167.3,262.5,179.9z"></path>
      <path d="M603,123C582.5,128.1,571.4,142.5,564.5,160.8C559.4,174.5,556.2,188.8,555.2,203.5C555.1,204.8,554.9,206.2,554.6,207.5C553.3,212.9,549.5,215.9,544.7,215.5C540.2,215,536.5,211.1,536,206C535.9,204.5,535.9,203,535.6,201.6C535.2,199.8,534.6,198.2,534,195.9C530,203.3,526.3,210.1,522.6,217C520.9,220.2,518.8,223.3,516.2,225.9C512,230.1,507,231.9,501.2,230.1C495.2,228.3,491.7,224,490.7,217.9C488.9,206.6,488.6,195.1,488.8,183.6C488.9,180.2,489.2,176.7,487.5,173.4C485.5,173.9,485.1,175.7,484.3,177.1C476.7,190.1,472.1,204.4,468.5,219C466.7,226.1,464.9,233.2,463.5,240.4C462.4,245.4,460.4,249.2,454.8,249.8C450.4,250.3,446.1,247.2,443.8,242C443.5,241.2,443.2,240.4,442.6,238.8C440.3,242.9,438.3,246.5,436.3,250C433.3,255.3,429.6,260.3,424.7,264.2C416.2,271,405.5,268.6,400.2,259.1C397.3,253.9,396.1,248.3,395.9,242.3C395.6,235.8,396.7,229.1,395.5,222.5C391.2,226.5,387,230.2,383.2,234.2C381.6,235.8,382.4,238.4,382.3,240.5C380.8,263.6,372.4,283.1,351.9,295.3C334.5,305.7,313.2,297.7,310.4,274.9C308.6,261.3,311,248.3,317.5,236.3C320.9,230,321.8,222.7,326.5,217C337.1,204,358.4,199.1,372.2,211.5C377.7,216.6,379,216.5,383.9,210.5C391.3,201.5,398.9,192.8,403.4,181.7C405.6,176.1,411.1,174.2,416.2,176.1C420.5,177.8,422.2,181.6,420.9,187.8C417.3,204.8,414.5,221.9,415.2,239.3C415.3,241.4,414.8,243.7,416.4,245.8C421.9,243.7,423.7,238.7,426.2,234.1C435.7,216.8,441,197.9,446.2,179C447.1,175.7,446.9,172.1,448.7,169C450.5,165.8,452.5,163,456.6,163.1C460.5,163.1,463.2,165.1,464.6,168.8C464.8,169.5,465.3,170.2,465.8,171.1C470,168.9,472,164.9,474.3,161.4C477.8,156.2,481.7,151.6,487.9,149.5C493.9,147.5,499.8,149.4,503.1,154.8C507.3,161.4,508,168.9,508.2,176.4C508.3,185,508.2,193.6,508.2,202.9C512.5,200.5,514.6,197.5,516.2,193.7C520,185.2,524.6,177.1,527.6,168.3C529.9,161.4,531.8,154.3,532.6,147.1C533,144,534.1,141.2,535.4,138.6C537.9,133.4,544.4,132.5,549,136.5C550.1,137.5,551,138.7,552.2,140.1C554.6,137.1,556.9,134.3,559.1,131.4C571.2,116,586.1,105.9,606.4,105.7C611.5,105.7,616.3,107.2,620.9,109.3C622.9,110.3,624.4,111.7,624.4,114.3C624.4,116.8,622.9,118.2,620.9,119.3C615.5,122.3,609.3,121.8,603,123M351.7,249.5C346.3,250.8,341.1,249.7,336,248C333.6,247.3,331.8,247.3,330.9,250.1C328.6,257.5,327.3,265,329,272.7C330.8,281,338.3,283.7,344.9,278.4C352.5,272.2,357.4,264.2,360.3,255C361,252.7,362.7,250.5,360.8,247.7C358.1,248.2,355.3,248.8,351.7,249.5M342.3,228.7C342.2,229.9,342.7,230.9,343.8,231.6C347,233.8,357.2,232.2,359.7,229.1C361.3,227.2,360.3,225.8,358.9,224.4C354.2,220.1,346,221.9,342.3,228.7z"></path>
      <path d="M416.6,152.6C410.1,152,406.2,149.3,405,144.4C403.8,139.4,406.6,135.8,409.9,132.6C413.2,129.5,419.6,128.8,423.5,130.8C426.9,132.5,428,135.6,427.6,139.1C427,145.8,423.8,150.6,416.6,152.6z"></path>
    </svg>`;

  const TXT = {
    ar: {
      hoursTitle: "أوقات العمل",
      defaultHours: "يومياً: 11:00 صباحاً – 2:00 بعد منتصف الليل",
      openNow: "مفتوح الآن • نستقبل طلباتكم",
      closedNow: "مغلق حالياً • نلقاكم قريباً",
      contactTitle: "التوصيل والتواصل",
      addressTitle: "موقعنا",
      viewMap: "افتح في الخريطة",
      rights: "جميع الحقوق محفوظة",
    },
    en: {
      hoursTitle: "Opening Hours",
      defaultHours: "Daily: 11:00 AM – 2:00 AM",
      openNow: "Open Now • Ready to serve",
      closedNow: "Closed Now • See you soon",
      contactTitle: "Delivery & Contact",
      addressTitle: "Our Location",
      viewMap: "Open in Google Maps",
      rights: "All rights reserved",
    },
  };

  let restData = null;

  function isRestaurantOpen() {
    const h = new Date().getHours();
    return h >= 11 || h < 2;
  }

  function esc(v) {
    return String(v ?? "").replace(/[&<>"']/g, (ch) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[ch]));
  }

  function renderFooter() {
    let footer = $("#siteFooter");
    if (!footer) {
      footer = document.createElement("footer");
      footer.className = "footer";
      footer.id = "siteFooter";
      $("#app").appendChild(footer);
    }
    if (!restData) return;

    const lang = html.lang === "en" ? "en" : "ar";
    const t = TXT[lang];
    const pick = (obj, k) => (lang === "en" && obj[k + "_en"]) || obj[k];

    const name = pick(restData, "name") || "TAZA 041";
    const tagline = pick(restData, "tagline") || "Love At First Bite!";
    const hours = pick(restData.contact || {}, "hours") || t.defaultHours;
    const address = pick(restData.contact || {}, "address") || "";
    const phones = (restData.contact && restData.contact.phones) || [];
    const social = restData.social || {};
    const open = isRestaurantOpen();

    const phonesHtml = phones
      .map((p) => {
        const lbl = pick(p, "label");
        return `
          <a class="footer-phone" href="tel:${esc(p.number)}">
            <span class="footer-phone__icon" aria-hidden="true">📞</span>
            <span class="footer-phone__info">
              <span class="footer-phone__label">${esc(lbl)}</span>
              <span class="footer-phone__num" dir="ltr">${esc(p.display || p.number)}</span>
            </span>
          </a>`;
      })
      .join("");

    footer.innerHTML = `
      <div class="footer__inner">
        <div class="footer__brand">
          <button class="footer__logo-btn" id="footerTopBtn" type="button" aria-label="Top">
            <img src="assets/images/logo.svg" alt="${esc(name)}">
          </button>
          <h2 class="footer__name">${esc(name)}</h2>
          <p class="footer__tagline">${esc(tagline)}</p>
        </div>

        <div class="footer__grid">
          <div class="footer-card">
            <div class="footer-card__head">
              <span class="footer-card__icon" aria-hidden="true">🕒</span>
              <h3 class="footer-card__title">${esc(t.hoursTitle)}</h3>
            </div>
            <p class="footer-card__text">${esc(hours)}</p>
            <div class="footer-status ${open ? "is-open" : "is-closed"}">
              <span class="footer-status__dot"></span>
              <span>${esc(open ? t.openNow : t.closedNow)}</span>
            </div>
          </div>

          <div class="footer-card">
            <div class="footer-card__head">
              <span class="footer-card__icon" aria-hidden="true">📍</span>
              <h3 class="footer-card__title">${esc(t.addressTitle)}</h3>
            </div>
            <p class="footer-card__text">${esc(address)}</p>
            ${social.map ? `
              <a class="footer-map-btn" href="${esc(social.map)}" target="_blank" rel="noopener noreferrer">
                <span>🗺️ ${esc(t.viewMap)}</span>
              </a>` : ""}
          </div>
        </div>

        <div class="footer-phones-wrap">
          <h3 class="footer-subhead">${esc(t.contactTitle)}</h3>
          <div class="footer-phones">${phonesHtml}</div>
        </div>

        <div class="footer__socials">
          ${social.instagram ? `
            <a class="social-btn" href="${esc(social.instagram)}" target="_blank" rel="noopener noreferrer" aria-label="Instagram">
              <svg viewBox="0 0 24 24" width="22" height="22" fill="none" stroke="currentColor" stroke-width="2.1" stroke-linecap="round" stroke-linejoin="round"><rect x="2" y="2" width="20" height="20" rx="5" ry="5"></rect><path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z"></path><line x1="17.5" y1="6.5" x2="17.51" y2="6.5"></line></svg>
            </a>` : ""}
          ${social.facebook ? `
            <a class="social-btn" href="${esc(social.facebook)}" target="_blank" rel="noopener noreferrer" aria-label="Facebook">
              <svg viewBox="0 0 24 24" width="22" height="22" fill="none" stroke="currentColor" stroke-width="2.1" stroke-linecap="round" stroke-linejoin="round"><path d="M18 2h-3a5 5 0 0 0-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 0 1 1-1h3z"></path></svg>
            </a>` : ""}
          ${social.map ? `
            <a class="social-btn" href="${esc(social.map)}" target="_blank" rel="noopener noreferrer" aria-label="Google Maps">
              <svg viewBox="0 0 24 24" width="22" height="22" fill="none" stroke="currentColor" stroke-width="2.1" stroke-linecap="round" stroke-linejoin="round"><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"></path><circle cx="12" cy="10" r="3"></circle></svg>
            </a>` : ""}
        </div>

        <hr class="footer__divider">

        <div class="dev-sig" dir="ltr">
          <span class="dev-sig__label">DESIGNED &amp; CRAFTED BY</span>
          <a class="poinr-btn" id="poinrBtn" href="https://www.instagram.com/poinr_m/" target="_blank" rel="noopener noreferrer" aria-label="Poinr Instagram">
            ${POINR_SVG}
            <span class="poinr-btn__tag">@poinr_m ↗</span>
          </a>
        </div>

        <p class="footer__copy">© ${new Date().getFullYear()} ${esc(name)} — ${esc(t.rights)}</p>
      </div>
    `;

    $("#footerTopBtn")?.addEventListener("click", () => scrollTo({ top: 0, behavior: "smooth" }));

    const poinrBtn = $("#poinrBtn");
    if (poinrBtn && "IntersectionObserver" in window) {
      const io = new IntersectionObserver((entries) => {
        entries.forEach((e) => {
          if (e.isIntersecting) {
            poinrBtn.classList.remove("is-drawn");
            void poinrBtn.offsetWidth;
            poinrBtn.classList.add("is-drawn");
          }
        });
      }, { threshold: 0.25 });
      io.observe(poinrBtn);

      poinrBtn.addEventListener("mouseenter", () => {
        poinrBtn.classList.remove("is-drawn");
        void poinrBtn.offsetWidth;
        poinrBtn.classList.add("is-drawn");
      });
    } else if (poinrBtn) {
      poinrBtn.classList.add("is-drawn");
    }
  }

  async function initFooter() {
    setupShareWidget();
    try {
      const res = await fetch("data/menu.json?v=" + Date.now());
      const json = await res.json();
      restData = json.restaurant;
      renderFooter();
    } catch (e) {}

    new MutationObserver(() => renderFooter()).observe(html, {
      attributes: true,
      attributeFilter: ["lang"],
    });
  }

  initFooter();
})();
