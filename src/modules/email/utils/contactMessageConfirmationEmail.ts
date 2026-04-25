interface ContactMessageConfirmationData {
  firstName: string;
  message: string;
}

const ContactMessageConfirmationEmailHtml = (
  data: ContactMessageConfirmationData,
): string => {
  const { firstName, message } = data;

  return `
<table width="100%" cellpadding="0" cellspacing="0" style="background-color:#f8fafc;padding:40px 0;font-family:Inter, Arial, sans-serif;">
  <tr>
    <td align="center">
      <table width="560" cellpadding="0" cellspacing="0" style="background:#ffffff;border-radius:16px;padding:32px;">

        <tr>
          <td style="font-size:22px;font-weight:600;color:#101828;padding-bottom:8px;">
            Thanks for reaching out, ${firstName}!
          </td>
        </tr>

        <tr>
          <td style="font-size:14px;color:#6a7282;padding-bottom:24px;line-height:1.5;">
            We have received your message and our team will get back to you as soon as possible.
          </td>
        </tr>

        <tr>
          <td style="border-top:1px solid #E5E7EB;padding-top:16px;"></td>
        </tr>

        <tr>
          <td style="font-size:14px;font-weight:600;color:#101828;padding-top:16px;padding-bottom:8px;">
            Your message
          </td>
        </tr>

        <tr>
          <td style="font-size:14px;color:#374151;white-space:pre-wrap;line-height:1.5;padding-bottom:24px;">
            ${message}
          </td>
        </tr>

        <tr>
          <td style="border-top:1px solid #E5E7EB;padding-top:16px;"></td>
        </tr>

        <tr>
          <td style="font-size:14px;color:#6a7282;padding-top:16px;line-height:1.5;">
            Best regards,<br/>
            The Anonymizer Team
          </td>
        </tr>

      </table>
    </td>
  </tr>
</table>
`;
};

export default ContactMessageConfirmationEmailHtml;
