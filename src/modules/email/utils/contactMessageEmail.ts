interface ContactMessageEmailData {
  firstName: string;
  lastName: string;
  email: string;
  phoneNumber: string;
  message: string;
}

const ContactMessageEmailHtml = (data: ContactMessageEmailData): string => {
  const { firstName, lastName, email, phoneNumber, message } = data;

  return `
<table width="100%" cellpadding="0" cellspacing="0" style="background-color:#f8fafc;padding:40px 0;font-family:Inter, Arial, sans-serif;">
  <tr>
    <td align="center">
      <table width="560" cellpadding="0" cellspacing="0" style="background:#ffffff;border-radius:16px;padding:32px;">

        <tr>
          <td style="font-size:22px;font-weight:600;color:#101828;padding-bottom:8px;">
            New Contact Message
          </td>
        </tr>

        <tr>
          <td style="font-size:14px;color:#6a7282;padding-bottom:24px;">
            A new submission was received through the contact form.
          </td>
        </tr>

        <tr>
          <td style="border-top:1px solid #E5E7EB;padding-top:16px;"></td>
        </tr>

        <tr>
          <td style="font-size:14px;color:#6a7282;padding-top:16px;padding-bottom:4px;">
            <strong style="color:#101828;">Name:</strong> ${firstName} ${lastName}
          </td>
        </tr>

        <tr>
          <td style="font-size:14px;color:#6a7282;padding-bottom:4px;">
            <strong style="color:#101828;">Email:</strong> ${email}
          </td>
        </tr>

        <tr>
          <td style="font-size:14px;color:#6a7282;padding-bottom:16px;">
            <strong style="color:#101828;">Phone:</strong> ${phoneNumber}
          </td>
        </tr>

        <tr>
          <td style="border-top:1px solid #E5E7EB;padding-top:16px;"></td>
        </tr>

        <tr>
          <td style="font-size:14px;font-weight:600;color:#101828;padding-top:16px;padding-bottom:8px;">
            Message
          </td>
        </tr>

        <tr>
          <td style="font-size:14px;color:#374151;white-space:pre-wrap;line-height:1.5;">
            ${message}
          </td>
        </tr>

      </table>
    </td>
  </tr>
</table>
`;
};

export default ContactMessageEmailHtml;
