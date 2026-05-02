package email

import (
	"fmt"
	"log"

	"github.com/goosenumps/backend/config"
	"github.com/resend/resend-go/v2"
)

var client *resend.Client

func Init() {
	if config.C.ResendAPIKey == "" || config.C.ResendAPIKey == "re_placeholder_replace_with_real_key" {
		log.Println("⚠️  Resend API key not set — emails will be logged to console only")
		return
	}
	client = resend.NewClient(config.C.ResendAPIKey)
}

func SendOTP(to, name, otp string) error {
	if client == nil {
		log.Printf("[DEV EMAIL] OTP for %s (%s): %s\n", name, to, otp)
		return nil
	}
	html := fmt.Sprintf(`
<!DOCTYPE html>
<html>
<body style="font-family:Inter,sans-serif;background:#f8f9ff;padding:40px 0">
  <div style="max-width:480px;margin:0 auto;background:#fff;border-radius:16px;border:1px solid #e2e8f0;overflow:hidden">
    <div style="background:#0F172A;padding:24px 32px;display:flex;align-items:center;gap:12px">
      <div style="width:36px;height:36px;background:#f97316;border-radius:8px;display:flex;align-items:center;justify-content:center;font-weight:700;color:#fff;font-size:16px">G</div>
      <span style="color:#fff;font-weight:700;font-size:18px">Goosenumps</span>
    </div>
    <div style="padding:32px">
      <h2 style="color:#0b1c30;font-size:22px;font-weight:700;margin:0 0 8px">Verify Your Account</h2>
      <p style="color:#64748b;font-size:14px;margin:0 0 24px">Hi %s, use the code below to verify your merchant account. This code expires in <strong>10 minutes</strong>.</p>
      <div style="background:#fff7ed;border:2px dashed #f97316;border-radius:12px;padding:24px;text-align:center;margin-bottom:24px">
        <p style="color:#9d4300;font-size:12px;font-weight:600;letter-spacing:0.1em;text-transform:uppercase;margin:0 0 8px">Your OTP Code</p>
        <p style="color:#0b1c30;font-size:40px;font-weight:700;letter-spacing:0.3em;margin:0">%s</p>
      </div>
      <p style="color:#94a3b8;font-size:12px;margin:0">If you didn't request this, please ignore this email. Do not share this code with anyone.</p>
    </div>
    <div style="background:#f8fafc;padding:16px 32px;border-top:1px solid #e2e8f0">
      <p style="color:#94a3b8;font-size:11px;margin:0;text-align:center">© 2024 Goosenumps Logistics Platform. All Rights Reserved.</p>
    </div>
  </div>
</body>
</html>`, name, otp)

	params := &resend.SendEmailRequest{
		From:    fmt.Sprintf("%s <%s>", config.C.EmailFromName, config.C.EmailFrom),
		To:      []string{to},
		Subject: fmt.Sprintf("[Goosenumps] Your verification code: %s", otp),
		Html:    html,
	}
	_, err := client.Emails.Send(params)
	return err
}

func SendPasswordSetup(to, name, token string, frontendURL string) error {
	if client == nil {
		log.Printf("[DEV EMAIL] Password setup link for %s: %s/auth/set-password?token=%s\n", to, frontendURL, token)
		return nil
	}
	link := fmt.Sprintf("%s/auth/set-password?token=%s", frontendURL, token)
	html := fmt.Sprintf(`
<!DOCTYPE html>
<html>
<body style="font-family:Inter,sans-serif;background:#f8f9ff;padding:40px 0">
  <div style="max-width:480px;margin:0 auto;background:#fff;border-radius:16px;border:1px solid #e2e8f0;overflow:hidden">
    <div style="background:#0F172A;padding:24px 32px">
      <span style="color:#fff;font-weight:700;font-size:18px">Goosenumps</span>
    </div>
    <div style="padding:32px">
      <h2 style="color:#0b1c30;font-size:22px;font-weight:700;margin:0 0 8px">🎉 Application Approved!</h2>
      <p style="color:#64748b;font-size:14px;margin:0 0 24px">Hi %s, your merchant application has been approved. Set up your password to access your merchant portal. This link expires in <strong>24 hours</strong>.</p>
      <a href="%s" style="display:block;background:#f97316;color:#fff;text-align:center;padding:14px 24px;border-radius:12px;font-weight:700;font-size:15px;text-decoration:none;margin-bottom:16px">
        Set Up My Password →
      </a>
      <p style="color:#94a3b8;font-size:12px">Or copy this link: <a href="%s" style="color:#f97316">%s</a></p>
    </div>
  </div>
</body>
</html>`, name, link, link, link)

	params := &resend.SendEmailRequest{
		From:    fmt.Sprintf("%s <%s>", config.C.EmailFromName, config.C.EmailFrom),
		To:      []string{to},
		Subject: "Your Goosenumps merchant account is approved — set your password",
		Html:    html,
	}
	_, err := client.Emails.Send(params)
	return err
}

func SendApprovalNotification(to, name string) error {
	if client == nil {
		log.Printf("[DEV EMAIL] Approval notification for %s (%s)\n", name, to)
		return nil
	}
	html := fmt.Sprintf(`
<!DOCTYPE html>
<html>
<body style="font-family:Inter,sans-serif;background:#f8f9ff;padding:40px 0">
  <div style="max-width:480px;margin:0 auto;background:#fff;border-radius:16px;border:1px solid #e2e8f0;overflow:hidden">
    <div style="background:#0F172A;padding:24px 32px">
      <span style="color:#fff;font-weight:700;font-size:18px">Goosenumps</span>
    </div>
    <div style="padding:32px">
      <div style="width:56px;height:56px;background:#f0fdf4;border-radius:50%%;display:flex;align-items:center;justify-content:center;margin-bottom:16px">
        <span style="font-size:28px">✅</span>
      </div>
      <h2 style="color:#0b1c30;font-size:22px;font-weight:700;margin:0 0 8px">Welcome to Goosenumps, %s!</h2>
      <p style="color:#64748b;font-size:14px;margin:0 0 16px">Your merchant account is now <strong style="color:#16a34a">active</strong>. You can now log in to your merchant portal and start managing orders.</p>
    </div>
  </div>
</body>
</html>`, name)

	params := &resend.SendEmailRequest{
		From:    fmt.Sprintf("%s <%s>", config.C.EmailFromName, config.C.EmailFrom),
		To:      []string{to},
		Subject: "Welcome to Goosenumps — Your account is live!",
		Html:    html,
	}
	_, err := client.Emails.Send(params)
	return err
}

func SendRejectionNotification(to, name, reason string) error {
	if client == nil {
		log.Printf("[DEV EMAIL] Rejection for %s (%s): %s\n", name, to, reason)
		return nil
	}
	html := fmt.Sprintf(`
<!DOCTYPE html>
<html>
<body style="font-family:Inter,sans-serif;background:#f8f9ff;padding:40px 0">
  <div style="max-width:480px;margin:0 auto;background:#fff;border-radius:16px;border:1px solid #e2e8f0;overflow:hidden">
    <div style="background:#0F172A;padding:24px 32px">
      <span style="color:#fff;font-weight:700;font-size:18px">Goosenumps</span>
    </div>
    <div style="padding:32px">
      <h2 style="color:#0b1c30;font-size:22px;font-weight:700;margin:0 0 8px">Application Update</h2>
      <p style="color:#64748b;font-size:14px;margin:0 0 16px">Hi %s, after reviewing your application we were unable to approve it at this time.</p>
      <div style="background:#fff1f2;border-left:4px solid #f43f5e;padding:12px 16px;border-radius:0 8px 8px 0;margin-bottom:16px">
        <p style="color:#be123c;font-size:13px;margin:0"><strong>Reason:</strong> %s</p>
      </div>
      <p style="color:#64748b;font-size:13px">You may reapply after addressing the above. Contact <a href="mailto:support@goosenumps.com" style="color:#f97316">support@goosenumps.com</a> for help.</p>
    </div>
  </div>
</body>
</html>`, name, reason)

	params := &resend.SendEmailRequest{
		From:    fmt.Sprintf("%s <%s>", config.C.EmailFromName, config.C.EmailFrom),
		To:      []string{to},
		Subject: "Update on your Goosenumps merchant application",
		Html:    html,
	}
	_, err := client.Emails.Send(params)
	return err
}
