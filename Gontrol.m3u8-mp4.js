
    const video = new Plyr('#main-video', {
      //debug:true,
      speed: {
        selected: 1,
        options: [0.5, 0.75, 1, 1.25, 1.5, 1.75, 2],
      },
      iconUrl: 'https://assets.mediadelivery.net/plyr/3.7.3.2/plyr.svg',
      captions: {
        active: false,
        language: '',
        update: true
      },
      controls: [
        "play-large", "play", "rewind", "fast-forward", "progress", "current-time", "duration", "mute", "volume", "captions",/**/ "settings", /*"pip",*/ "fullscreen" /* ,"download"  */
      ],
      /*	thumbnail:{
      		enabled:true,
      	    pic_num: 184,
      		width: 178,
      		height: 100,
      		col: 7,
      		row: 7,
      		offsetX:0,
      		offsetY:0,
      		urls: ['https://cdn.plyr.io/static/demo/thumbs/100p-00001.jpg',
      		'https://cdn.plyr.io/static/demo/thumbs/100p-00002.jpg',
      		'https://cdn.plyr.io/static/demo/thumbs/100p-00003.jpg',
      		'https://cdn.plyr.io/static/demo/thumbs/100p-00004.jpg']
      	}, */
        i18n: {
          restart: 'รีสตาร์ท',
          rewind: 'ย้อนกลับ {seektime}วินาที',
          play: 'เล่น',
          pause: 'หยุดชั่วคราว',
          fastForward: 'ไปข้างหน้า {seektime}วินาที',
          seek: 'ค้นหา',
          seekLabel: '{currentTime} จาก {duration}',
          played: 'เล่นแล้ว',
          buffered: 'บัฟเฟอร์',
          currentTime: 'เวลาปัจจุบัน',
          duration: 'ระยะเวลา',
          volume: 'ความดังเสียง',
          mute: 'ปิดเสียง',
          unmute: 'เปิดเสียง',
          enableCaptions: 'เปิดใช้งานคำบรรยาย',
          disableCaptions: 'ปิดใช้งานคำบรรยาย',
          download: 'ดาวน์โหลด',
          enterFullscreen: 'เข้าสู่โหมดเต็มหน้าจอ',
          exitFullscreen: 'ออกจากโหมดเต็มหน้าจอ',
          frameTitle: 'เครื่องเล่นสำหรับ {title}',
          captions: 'คำบรรยาย',
          settings: 'การตั้งค่า',
          pip: 'PIP',
          menuBack: 'กลับไปที่เมนูก่อนหน้า',
          speed: 'ความเร็ว',
          normal: 'ปกติ',
          quality: 'คุณภาพ',
          loop: 'ลูป',
          start: 'เริ่มต้น',
          end: 'จบ',
          all: 'ทั้งหมด',
          reset: 'รีเซ็ต',
          disabled: 'ปิดใช้งาน',
          enabled: 'เปิดใช้งาน',
          advertisement: 'โฆษณา',
          qualityBadge: {
            2160: '4K',
            1440: 'HD',
            1080: 'HD',
            720: 'HD',
            576: 'SD',
            480: 'SD',
        }
      }
    });










/* ==========================================================
   ส่วนเสริม: ควบคุมคีย์บอร์ด (คอม) + ลากนิ้วเฉพาะจุด (มือถือ)
   ========================================================== */
   
(function() {
    // --- 1. ฟังก์ชันตัวช่วย: แปลงวินาทีเป็น 00:00 ---
    function formatTime(seconds) {
        const min = Math.floor(seconds / 60);
        const sec = Math.floor(seconds % 60);
        return (min < 10 ? '0' : '') + min + ':' + (sec < 10 ? '0' : '') + sec;
    }

    // --- 2. ฟังก์ชันแสดงกล่องแจ้งเตือน (Toast) ---
    function showStatusToast(content, isVolume = true, direction = 0) {
        const v = document.getElementById('main-video');
        if (!v) return;

        const fsElem = document.fullscreenElement || document.webkitFullscreenElement || document.mozFullScreenElement || document.msFullscreenElement;
        let wrapper = fsElem || v?.closest('.plyr') || document.getElementById('video-container') || document.body;
        let toast = document.getElementById('custom-vol-toast');
        
        if (!toast) {
            toast = document.createElement('div');
            toast.id = 'custom-vol-toast';
            Object.assign(toast.style, {
                backgroundColor: 'rgba(220, 0, 0, 0.6)', color: '#ffffff',
                padding: '4px 12px', borderRadius: '6px', fontSize: '18px',
                zIndex: '2147483647', pointerEvents: 'none', display: 'none',
                fontWeight: '600', fontFamily: 'sans-serif', backdropFilter: 'blur(5px)',
                boxShadow: '0 0 10px rgba(0,0,0,0.5)', border: '1px solid rgba(255, 255, 255, 0.3)'
            });
        }

        const isFS = !!fsElem;
        toast.style.position = isFS ? 'fixed' : 'absolute';
        toast.style.top = isFS ? '80px' : '20px';
        
        if (isVolume) {
            toast.style.left = 'auto';
            toast.style.right = '15px'; // เสียงอยู่ขวา
        } else {
            toast.style.right = 'auto';
            toast.style.left = '15px';  // กรอภาพอยู่ซ้าย
        }

        wrapper.appendChild(toast);
        // 📍 ใช้ไอคอน ▶▶ / ◀◀ ตามที่พี่ปรับมา
        let icon = isVolume ? '🔊 ' : (direction >= 0 ? '▶▶ ' : '◀◀ ');
        let text = isVolume ? Math.round(content * 100) + '%' : formatTime(content);
        toast.innerHTML = icon + text;
        toast.style.display = 'block';

        clearTimeout(window.volumeTimeout);
        window.volumeTimeout = setTimeout(() => { toast.style.display = 'none'; }, 1200);
    }

    // ==========================================
    // PART 1: คีย์บอร์ด (เพิ่มการเช็ค Focus เพื่อไม่กวน JW Player)
    // ==========================================
    document.addEventListener('keydown', function(e) {
        if (["input", "textarea"].includes(e.target.tagName.toLowerCase())) return;

        const v = document.getElementById('main-video');
        if (!v) return;

        // 📍 เช็คว่าเรากำลังใช้งานเครื่องเล่นหลักอยู่หรือไม่ (เมาส์ชี้อยู่ หรือ คลิกทำงานอยู่)
        // ถ้าเมาส์ไม่ได้ชี้ที่ตัวหลัก และในหน้ามี JW Player (#player) ให้ข้ามไปเลย
        const isHoveringMain = v.closest('.plyr')?.matches(':hover') || v.matches(':hover') || v.contains(document.activeElement);
        if (!isHoveringMain && document.querySelector('#player')) return;

        let handled = false;
        switch(e.keyCode) {
            case 38: v.volume = Math.min(1, v.volume + 0.05); showStatusToast(v.volume, true); handled = true; break;
            case 40: v.volume = Math.max(0, v.volume - 0.05); showStatusToast(v.volume, true); handled = true; break;
            case 37: v.currentTime -= 10; showStatusToast(v.currentTime, false, -1); handled = true; break;
            case 39: v.currentTime += 10; showStatusToast(v.currentTime, false, 1); handled = true; break;
        }
        if (handled) { e.preventDefault(); e.stopImmediatePropagation(); }
    }, true);

    // ==========================================
    // PART 2: มือถือ (คงไว้ตามที่พี่ปรับมาเป๊ะๆ)
    // ==========================================
    window.addEventListener('load', function() {
        const vContainer = document.querySelector('.plyr') || document.getElementById('video-container') || document.getElementById('main-video');
        const v = document.getElementById('main-video');
        if (!vContainer || !v) return;

        let startX = 0, startY = 0;

        vContainer.addEventListener('touchstart', function(e) {
            startX = e.touches[0].pageX;
            startY = e.touches[0].pageY;
        }, { passive: false });

        vContainer.addEventListener('touchmove', function(e) {
            const currentX = e.touches[0].pageX;
            const currentY = e.touches[0].pageY;
            const diffX = currentX - startX;
            const diffY = currentY - startY;
            const rect = vContainer.getBoundingClientRect();

            // 📍 [1. ตรวจสอบโซนปลอดภัย - เว้นแถบล่างไว้ 30%]
            // ถ้าจิ้มนิ้วลงในพื้นที่ต่ำกว่า 70% ของความสูงวิดีโอ (แถวๆ ปุ่ม Play) จะไม่ทำงาน
            const isSafeZone = (startY - rect.top) < (rect.height * 0.7);
            if (!isSafeZone) return;


            if (Math.abs(diffY) > Math.abs(diffX)) {
                // 📍 [2. ปรับเสียง - เฉพาะฝั่งขวา 70% ของความกว้าง]
                const isRightSide = (startX - rect.left) > (rect.width * 0.9);
                if (isRightSide && Math.abs(diffY) > 20) {
                    v.volume = Math.max(0, Math.min(1, v.volume - (diffY / 500)));
                    startY = currentY;
                    showStatusToast(v.volume, true);
                    if (e.cancelable) e.preventDefault();
                }
            } else {
                // 📍 [3. กรอภาพ - ทำได้ทั่วบริเวณในโซนปลอดภัย]
                if (Math.abs(diffX) > 40) {
                    v.currentTime += (diffX / 20);
                    showStatusToast(v.currentTime, false, diffX);
                    startX = currentX;
                    if (e.cancelable) e.preventDefault();
                }
            }
        }, { passive: false });
    });
})();

/*  ==========================================================
 💡 ทริคเล็กๆ ทิ้งท้าย:
ถ้าวันไหนรู้สึกว่า "ลากนิ้วแล้วเวลามันวิ่งเร็วไป" หรือ "ช้าไป" พี่สามารถปรับแก้ได้เองง่ายๆ ตรงบรรทัดนี้นะครับ:


v.currentTime += (diff / 15);


ถ้าเปลี่ยนจาก 15 เป็น 30 = จะต้องลากนิ้วยาวขึ้นเพื่อให้เวลาเดิน (หนืดขึ้น/ละเอียดขึ้น)


ถ้าเปลี่ยนจาก 15 เป็น 5 = ลากนิดเดียวเวลาจะวิ่งไปไกลเลย (ไวขึ้น)


💡 จุดที่พี่สามารถปรับแต่งเองได้:
ถ้าอยากให้กล่องเล็กลงอีก: ลดตัวเลข padding: '4px 12px' (เลข 4 คือ บน-ล่าง, 12 คือ ซ้าย-ขวา)


ถ้าอยากให้ตัวหนังสือเล็กลงอีก: ลดตัวเลข fontSize: '18px'


การแยกส่วน: ผมแบ่ง PART 1 และ PART 2 ไว้ให้แล้ว พี่สามารถก๊อปปี้เฉพาะส่วนไปแก้ไขได้ง่ายขึ้นครับ


💡 จุดที่พี่สามารถปรับเปลี่ยนเองได้:
ไปที่บรรทัดที่มีเขียนว่า (rect.width * 0.7) ครับ:


ถ้าใช้ 0.7: พื้นที่ลากเสียงจะอยู่ที่ 30% สุดท้ายของจอฝั่งขวา


ถ้าใช้ 0.8: พื้นที่ลากเสียงจะเล็กลงไปอีก เหลือแค่ 20% สุดท้ายของจอฝั่งขวา (ชิดขอบมาก)


ถ้าใช้ 0.5: คือการแบ่งครึ่งหน้าจอพอดี (แบบเดิม)


ผมตั้งไว้ให้ที่ 0.7 ก่อนนะครับ พี่ลองลากดูว่านิ้วสัมผัสของพี่มันอยู่ชิดขอบพอดีกับความถนัดหรือยัง ถ้าอยากให้บีบพื้นที่เข้าหาขอบอีก ก็แค่แก้เป็น 0.8 หรือ 0.85 ได้เลยครับ! 😊✌️

💡 สิ่งที่ผมเพิ่มเข้าไปให้พี่:
isSafeZone: ผมสร้างตัวแปรนี้ขึ้นมาเพื่อเช็คว่า นิ้วที่พี่จิ้มลงไปครั้งแรกเนี่ย มันอยู่สูงกว่าแถบเมนูข้างล่างหรือเปล่า

rect.height * 0.8: ผมตั้งไว้ว่า พื้นที่ล่างสุด 20% ของวิดีโอจะห้ามลากกรอภาพ (เพื่อให้พี่กดปุ่ม Play/Pause หรือลากแถบเวลาจริงได้ถนัด) พี่จะสามารถลากนิ้วได้เฉพาะพื้นที่ 80% ด้านบนของตัวเล่นวิดีโอครับ

วิธีปรับแต่งเพิ่มเติม:

ถ้าพี่รู้สึกว่ายังโดนเมนูอยู่ ให้เปลี่ยน 0.8 เป็น 0.7 (พื้นที่ลากจะเล็กลงแต่ปลอดภัยขึ้น)

ถ้าอยากให้ลากได้เกือบถึงข้างล่าง ให้เปลี่ยนเป็น 0.9 ครับ

ถ้าอยากให้เว้นแถบล่างมากขึ้น: เปลี่ยนเลข 0.8 เป็น 0.7 หรือ 0.6 ในส่วนของ isSafeZone

ถ้าอยากให้พื้นที่ลากเสียงกว้างขึ้น: เปลี่ยนเลข 0.7 เป็น 0.5 ในส่วนของ isRightSide

   ==========================================================  */






