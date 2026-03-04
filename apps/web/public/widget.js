(function () {
  "use strict";

  var VIOLET = "#7c3aed";
  var BG = "#f5f3ff";

  function MagicLinkKit(config) {
    if (!config || !config.apiKey) throw new Error("MagicLinkKit: apiKey required");
    this.apiKey = config.apiKey;
    this.baseUrl = config.baseUrl || "";
    this.mode = config.mode || "magic-link";
  }

  MagicLinkKit.prototype.sendMagicLink = function (email, opts) {
    return fetch(this.baseUrl + "/api/magic-link/send", {
      method: "POST",
      headers: { "Content-Type": "application/json", "X-Api-Key": this.apiKey },
      body: JSON.stringify({ email: email, redirect_url: opts && opts.redirectUrl, metadata: opts && opts.metadata }),
    }).then(function (r) { return r.json(); });
  };

  MagicLinkKit.prototype.sendOtp = function (email) {
    return fetch(this.baseUrl + "/api/otp/send", {
      method: "POST",
      headers: { "Content-Type": "application/json", "X-Api-Key": this.apiKey },
      body: JSON.stringify({ email: email }),
    }).then(function (r) { return r.json(); });
  };

  MagicLinkKit.prototype.verifyOtp = function (email, code) {
    return fetch(this.baseUrl + "/api/otp/verify", {
      method: "POST",
      headers: { "Content-Type": "application/json", "X-Api-Key": this.apiKey },
      body: JSON.stringify({ email: email, code: code }),
    }).then(function (r) { return r.json(); });
  };

  MagicLinkKit.prototype.renderForm = function (containerId) {
    var self = this;
    var el = document.getElementById(containerId);
    if (!el) throw new Error("MagicLinkKit: container not found");

    el.innerHTML = "";
    var form = document.createElement("form");
    form.style.cssText = "max-width:360px;margin:0 auto;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,sans-serif;";

    var emailInput = document.createElement("input");
    emailInput.type = "email";
    emailInput.placeholder = "Enter your email";
    emailInput.required = true;
    emailInput.style.cssText = "width:100%;padding:12px;border:2px solid #e5e7eb;border-radius:8px;font-size:16px;box-sizing:border-box;outline:none;margin-bottom:12px;";
    emailInput.onfocus = function () { this.style.borderColor = VIOLET; };
    emailInput.onblur = function () { this.style.borderColor = "#e5e7eb"; };

    var btn = document.createElement("button");
    btn.type = "submit";
    btn.textContent = self.mode === "otp" ? "Send Code" : "Send Magic Link";
    btn.style.cssText = "width:100%;padding:12px;background:" + VIOLET + ";color:#fff;border:none;border-radius:8px;font-size:16px;font-weight:600;cursor:pointer;";

    var msg = document.createElement("p");
    msg.style.cssText = "text-align:center;margin-top:12px;font-size:14px;color:#6b7280;min-height:20px;";

    var otpWrap = document.createElement("div");
    otpWrap.style.cssText = "display:none;margin-top:12px;";
    var otpInput = document.createElement("input");
    otpInput.type = "text";
    otpInput.maxLength = 6;
    otpInput.placeholder = "6-digit code";
    otpInput.style.cssText = "width:100%;padding:12px;border:2px solid #e5e7eb;border-radius:8px;font-size:24px;text-align:center;letter-spacing:8px;box-sizing:border-box;outline:none;margin-bottom:12px;";
    var verifyBtn = document.createElement("button");
    verifyBtn.type = "button";
    verifyBtn.textContent = "Verify Code";
    verifyBtn.style.cssText = btn.style.cssText;
    otpWrap.appendChild(otpInput);
    otpWrap.appendChild(verifyBtn);

    form.appendChild(emailInput);
    form.appendChild(btn);
    form.appendChild(msg);
    form.appendChild(otpWrap);
    el.appendChild(form);

    form.onsubmit = function (e) {
      e.preventDefault();
      btn.disabled = true;
      btn.textContent = "Sending...";
      msg.textContent = "";
      var email = emailInput.value;

      var promise = self.mode === "otp" ? self.sendOtp(email) : self.sendMagicLink(email);
      promise.then(function (res) {
        if (res.error) { msg.textContent = res.error; msg.style.color = "#dc2626"; }
        else if (self.mode === "otp") { otpWrap.style.display = "block"; msg.textContent = "Check your email for a code."; msg.style.color = "#6b7280"; }
        else { msg.textContent = "Check your email for a magic link!"; msg.style.color = VIOLET; }
      }).catch(function () { msg.textContent = "Something went wrong."; msg.style.color = "#dc2626"; })
        .finally(function () { btn.disabled = false; btn.textContent = self.mode === "otp" ? "Send Code" : "Send Magic Link"; });
    };

    verifyBtn.onclick = function () {
      verifyBtn.disabled = true;
      verifyBtn.textContent = "Verifying...";
      self.verifyOtp(emailInput.value, otpInput.value).then(function (res) {
        if (res.token) { msg.textContent = "Verified!"; msg.style.color = VIOLET; if (self.onSuccess) self.onSuccess(res); }
        else { msg.textContent = res.error || "Invalid code"; msg.style.color = "#dc2626"; }
      }).catch(function () { msg.textContent = "Something went wrong."; msg.style.color = "#dc2626"; })
        .finally(function () { verifyBtn.disabled = false; verifyBtn.textContent = "Verify Code"; });
    };
  };

  window.MagicLinkKit = MagicLinkKit;
})();
