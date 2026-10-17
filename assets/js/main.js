/**
 * 合同会社マヌルアセット (Manul Asset LLC) コーポレートサイト
 * メインスクリプト (main.js)
 * 
 * 機能一覧:
 * 1. スクロール検知によるヘッダーの縮小＆背景スタイル変更
 * 2. IntersectionObserver を用いたスクロール連動フェードインアニメーション
 * 3. モバイル向けハンバーガーメニューの開閉制御
 * 4. ナビゲーションリンクのスムーズスクロール
 * 5. トップへ戻るボタンの表示・非表示およびスクロール動作
 * 6. お問い合わせフォームの送信ダミー処理＆トースト通知表示
 * 7. 工程表サンプルプレビューモーダルの開閉制御
 */

document.addEventListener('DOMContentLoaded', () => {
  'use strict';

  // ------------------------------------------------------------------------
  // 1. スクロール検知によるヘッダーの制御
  // ------------------------------------------------------------------------
  const header = document.querySelector('.site-header');
  const backToTopBtn = document.querySelector('.back-to-top');

  const handleScroll = () => {
    const scrollY = window.pageYOffset || document.documentElement.scrollTop;

    // ヘッダーのスタイル切り替え (50px以上スクロール時)
    if (scrollY > 50) {
      header.classList.add('scrolled');
    } else {
      header.classList.remove('scrolled');
    }

    // トップへ戻るボタンの表示制御 (300px以上スクロール時)
    if (backToTopBtn) {
      if (scrollY > 300) {
        backToTopBtn.classList.add('visible');
      } else {
        backToTopBtn.classList.remove('visible');
      }
    }
  };

  window.addEventListener('scroll', handleScroll, { passive: true });
  handleScroll(); // 初期読み込み時の判定

  // ------------------------------------------------------------------------
  // 2. モバイル用ハンバーガーメニュー
  // ------------------------------------------------------------------------
  const mobileToggle = document.querySelector('.mobile-toggle');
  const navMenu = document.querySelector('.nav-menu');
  const navLinks = document.querySelectorAll('.nav-link');

  if (mobileToggle && navMenu) {
    mobileToggle.addEventListener('click', () => {
      mobileToggle.classList.toggle('active');
      navMenu.classList.toggle('open');
      document.body.classList.toggle('no-scroll');
    });

    // メニュー項目クリック時にナビゲーションを閉じる
    navLinks.forEach(link => {
      link.addEventListener('click', () => {
        mobileToggle.classList.remove('active');
        navMenu.classList.remove('open');
        document.body.classList.remove('no-scroll');
      });
    });
  }

  // ------------------------------------------------------------------------
  // 3. スムーズスクロール (ヘッダーの高さオフセット計算)
  // ------------------------------------------------------------------------
  document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', function(e) {
      const targetId = this.getAttribute('href');
      if (targetId === '#' || targetId === '') return;

      const targetElement = document.querySelector(targetId);
      if (targetElement) {
        e.preventDefault();
        const headerHeight = header.offsetHeight || 80;
        const elementPosition = targetElement.getBoundingClientRect().top;
        const offsetPosition = elementPosition + window.pageYOffset - (headerHeight - 10);

        window.scrollTo({
          top: offsetPosition,
          behavior: 'smooth'
        });
      }
    });
  });

  // トップへ戻るボタンのクリックイベント
  if (backToTopBtn) {
    backToTopBtn.addEventListener('click', () => {
      window.scrollTo({
        top: 0,
        behavior: 'smooth'
      });
    });
  }

  // ------------------------------------------------------------------------
  // 4. スクロール連動アニメーション (IntersectionObserver)
  // ------------------------------------------------------------------------
  const revealElements = document.querySelectorAll('.reveal');

  if ('IntersectionObserver' in window) {
    const observerOptions = {
      root: null,
      rootMargin: '0px 0px -60px 0px',
      threshold: 0.15
    };

    const observer = new IntersectionObserver((entries, observer) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          entry.target.classList.add('active');
          // 一度表示されたら監視を解除して軽量化
          observer.unobserve(entry.target);
        }
      });
    }, observerOptions);

    revealElements.forEach(el => observer.observe(el));
  } else {
    // 古いブラウザ向けのフォールバック
    revealElements.forEach(el => el.classList.add('active'));
  }

  // ------------------------------------------------------------------------
  // 5. お問い合わせフォーム送信処理 (Googleフォーム連携 & トースト通知)
  // ------------------------------------------------------------------------
  const contactForm = document.getElementById('contactForm');
  const toastNotification = document.getElementById('toastNotification');

  /**
   * Googleフォーム連携設定
   * 
   * 【設定方法】
   * 1. Googleフォームを作成し、質問項目（お名前、貴社名、メールアドレス、種別、内容）を追加します。
   * 2. フォームの「formResponse」URLを formActionUrl に設定します。
   *    例: 'https://docs.google.com/forms/u/0/d/e/1FAIpQLScXXXXXXXXXXXX/formResponse'
   * 3. 各項目の entry ID (例: entry.1234567890) を下記の fields に設定します。
   * 4. Googleフォームの「設定」>「回答」>「新しい回答についてのメール通知を受け取る」をONにすると、
   *    フォーム送信時にリアルタイムでGmailへ通知メールが届きます。
   */
  const GOOGLE_FORM_CONFIG = {
    // Googleフォームの formResponse URL
    formActionUrl: 'https://docs.google.com/forms/d/e/1FAIpQLSdDRw6p1__bRnfdJsEH3CcvTNz-RGPrei7SnxraE0OZu1CjAg/formResponse', 
    fields: {
      name: 'entry.1064488253',        // お名前
      company: 'entry.681185609',      // 貴社名・金融機関名
      email: 'entry.1684557310',       // メールアドレス
      category: 'entry.288260855',     // お問い合わせ種別
      message: 'entry.1699882823'      // お問い合わせ内容
    }
  };

  if (contactForm) {
    const submitBtn = contactForm.querySelector('button[type="submit"]');
    const privacyAgreement = document.getElementById('privacyAgreement');

    // 「個人情報の取り扱いに同意する」チェックボックスの連動
    if (privacyAgreement && submitBtn) {
      // 初期状態：未チェックならボタンを非活性化
      submitBtn.disabled = !privacyAgreement.checked;

      privacyAgreement.addEventListener('change', () => {
        submitBtn.disabled = !privacyAgreement.checked;
      });
    }

    contactForm.addEventListener('submit', async (e) => {
      e.preventDefault();

      // 同意チェックの二重バリデーション
      if (privacyAgreement && !privacyAgreement.checked) {
        alert('「個人情報の取り扱い」に同意の上、チェックを入れて送信してください。');
        privacyAgreement.focus();
        return;
      }

      const originalText = submitBtn.innerHTML;

      // 送信中ステータス表示
      submitBtn.disabled = true;
      submitBtn.innerHTML = `
        <svg style="animation: spin 1s linear infinite; display: inline-block; vertical-align: middle; margin-right: 8px;" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
          <circle cx="12" cy="12" r="10" stroke-opacity="0.25"></circle>
          <path d="M12 2a10 10 0 0 1 10 10"></path>
        </svg> 送信中...
      `;

      // フォーム入力値の取得
      const nameVal = document.getElementById('name').value.trim();
      const companyVal = document.getElementById('companyName').value.trim() || '（未記入）';
      const emailVal = document.getElementById('email').value.trim();
      const categorySelect = document.getElementById('category');
      const categoryVal = categorySelect.options[categorySelect.selectedIndex].text;
      const messageVal = document.getElementById('message').value.trim();

      try {
        if (GOOGLE_FORM_CONFIG.formActionUrl && GOOGLE_FORM_CONFIG.formActionUrl.trim() !== '') {
          // Googleフォーム用の送信データ (URLエンコード形式) を構築
          const formData = new URLSearchParams();
          formData.append(GOOGLE_FORM_CONFIG.fields.name, nameVal);
          formData.append(GOOGLE_FORM_CONFIG.fields.company, companyVal);
          formData.append(GOOGLE_FORM_CONFIG.fields.email, emailVal);

          // 種別の判定（規定選択肢か、その他か）
          const standardCategories = ['事業内容について', '収益不動産情報のご提案', '金融取引・融資のご相談', '合同会社の設立・伴走支援のご相談'];
          if (standardCategories.includes(categoryVal)) {
            formData.append(GOOGLE_FORM_CONFIG.fields.category, categoryVal);
          } else {
            formData.append(GOOGLE_FORM_CONFIG.fields.category, '__other_option__');
            formData.append(`${GOOGLE_FORM_CONFIG.fields.category}.other_option_response`, categoryVal);
          }

          formData.append(GOOGLE_FORM_CONFIG.fields.message, messageVal);

          // Googleフォームへ非同期送信 (CORS制限を回避するため mode: 'no-cors' を指定)
          await fetch(GOOGLE_FORM_CONFIG.formActionUrl, {
            method: 'POST',
            mode: 'no-cors',
            headers: {
              'Content-Type': 'application/x-www-form-urlencoded'
            },
            body: formData
          });
        } else {
          // 設定前のテスト用シミュレーション（1秒待機）
          await new Promise(resolve => setTimeout(resolve, 1000));
        }

        // 完了処理
        submitBtn.innerHTML = originalText;
        contactForm.reset();
        submitBtn.disabled = true; // リセット後は再び非活性に

        // トースト通知を表示
        if (toastNotification) {
          toastNotification.classList.add('show');
          setTimeout(() => {
            toastNotification.classList.remove('show');
          }, 6000);
        }
      } catch (err) {
        console.error('送信エラー:', err);
        submitBtn.disabled = false;
        submitBtn.innerHTML = originalText;
        alert('送信処理中にエラーが発生しました。恐れ入りますが、お電話またはメールにて直接お問い合わせください。');
      }
    });
  }
});

// スピナー用インラインキーフレーム
const style = document.createElement('style');
style.textContent = `
  @keyframes spin {
    from { transform: rotate(0deg); }
    to { transform: rotate(360deg); }
  }
`;
document.head.appendChild(style);

// ------------------------------------------------------------------------
// 7. 工程表サンプルプレビューモーダル制御
// ------------------------------------------------------------------------
(function () {
  const roadmapModal   = document.getElementById('roadmapModal');
  const openBtn        = document.getElementById('openRoadmapBtn');
  const closeBtn       = document.getElementById('closeRoadmapBtn');
  const contactBtn     = document.getElementById('roadmapContactBtn');
  const categorySelect = document.getElementById('category');

  // トースト要素を動的生成（DOM未定義のため）
  const taskToast = document.createElement('div');
  taskToast.id = 'roadmapTaskToast';
  taskToast.className = 'roadmap-task-toast';
  taskToast.textContent = '🔒 こちらの完全版手順・削減根拠・実務解説テキストおよび編集可能データ（setup-roadmap.html）は、ご契約いただいたクライアント限定で配布・公開しております。';
  document.body.appendChild(taskToast);

  let toastTimer = null;

  /** モーダルを開く */
  const openModal = () => {
    if (!roadmapModal) return;
    roadmapModal.classList.add('open');
    document.body.classList.add('no-scroll');
  };

  /** モーダルを閉じる */
  const closeModal = () => {
    if (!roadmapModal) return;
    roadmapModal.classList.remove('open');
    document.body.classList.remove('no-scroll');
  };

  /** タスク行クリック時の限定案内トースト */
  const showTaskToast = () => {
    taskToast.classList.add('show');
    if (toastTimer) clearTimeout(toastTimer);
    toastTimer = setTimeout(() => {
      taskToast.classList.remove('show');
    }, 5000);
  };

  // プレビューボタンでモーダルを開く
  if (openBtn) {
    openBtn.addEventListener('click', openModal);
  }

  // 閉じるボタン
  if (closeBtn) {
    closeBtn.addEventListener('click', closeModal);
  }

  // オーバーレイ（背景）クリックで閉じる
  if (roadmapModal) {
    roadmapModal.addEventListener('click', (e) => {
      if (e.target === roadmapModal) closeModal();
    });
  }

  // ESCキーで閉じる
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && roadmapModal && roadmapModal.classList.contains('open')) {
      closeModal();
    }
  });

  // タスク行クリック時に🔒案内トーストを表示
  document.querySelectorAll('.roadmap-task-row').forEach(row => {
    row.addEventListener('click', showTaskToast);
  });

  // お問い合わせCTAボタン：モーダルを閉じ、#contactへスクロール＆カテゴリ自動選択
  if (contactBtn) {
    contactBtn.addEventListener('click', () => {
      closeModal();

      // カテゴリを「合同会社の設立・伴走支援のご相談」に自動設定
      if (categorySelect) {
        const options = Array.from(categorySelect.options);
        const target = options.find(opt => opt.value === 'incubation');
        if (target) {
          categorySelect.value = 'incubation';
          // change イベントを発火（バリデーション等に連動）
          categorySelect.dispatchEvent(new Event('change'));
        }
      }

      // #contact セクションへスムーズスクロール
      const contactSection = document.getElementById('contact');
      if (contactSection) {
        const headerHeight = document.querySelector('.site-header')?.offsetHeight || 80;
        const y = contactSection.getBoundingClientRect().top + window.pageYOffset - (headerHeight - 10);
        window.scrollTo({ top: y, behavior: 'smooth' });
      }
    });
  }
})();


