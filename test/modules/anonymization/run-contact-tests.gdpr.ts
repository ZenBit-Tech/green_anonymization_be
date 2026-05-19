import { COMPLIANCE_FRAMEWORKS } from '@common/constants';
import AnonymizationService from 'modules/anonymization/anonymization.service';

const runContactTestsGDPR = (getService: () => AnonymizationService) => {
  describe('GDPR contact information anonymization', () => {
    let service: AnonymizationService;

    beforeEach(() => {
      service = getService();
    });

    it('should anonymize a long sentence containing multiple contact information types', async () => {
      const input =
        'You can reach me at alex.petrenko@gmail.com, or a.petrenko@workmail.co, and sometimes I still use my old address alexp01@yahoo.com, while my phone could be +380501234567, (050) 123-45-67, or even written as 0501234567.';

      const result = await service.anonymize(
        COMPLIANCE_FRAMEWORKS.GDPR_EU,
        input,
      );

      const regex =
        /^You can reach me at <[^>]+>, or <[^>]+>, and sometimes I still use my old address <[^>]+>, while my phone could be <[^>]+>, <[^>]+>, or even written as <[^>]+>\.$/;

      expect(result.anonymizedText).toMatch(regex);
    });

    it('should anonymize: Gmail alias (test.user+alias@gmail.com)', async () => {
      const input = 'Email me at test.user+alias@gmail.com.';
      const result = await service.anonymize(
        COMPLIANCE_FRAMEWORKS.GDPR_EU,
        input,
      );
      expect(result.anonymizedText).toMatch(/^Email me at <[^>]+>\.$/);
    });

    it('should anonymize: Proton email (user_name123@proton.me)', async () => {
      const input = 'Reach out: user_name123@proton.me';
      const result = await service.anonymize(
        COMPLIANCE_FRAMEWORKS.GDPR_EU,
        input,
      );
      expect(result.anonymizedText).toMatch(/^Reach out: <[^>]+>$/);
    });

    it('should anonymize: US phone (+1 (555) 123-4567)', async () => {
      const input = 'Phone: +1 (555) 123-4567';
      const result = await service.anonymize(
        COMPLIANCE_FRAMEWORKS.GDPR_EU,
        input,
      );
      expect(result.anonymizedText).toMatch(/^Phone: <[^>]+>$/);
    });

    it('should anonymize: UK phone (0044 20 7946 0958)', async () => {
      const input = 'Alt: 0044 20 7946 0958';
      const result = await service.anonymize(
        COMPLIANCE_FRAMEWORKS.GDPR_EU,
        input,
      );
      expect(result.anonymizedText).toMatch(/^Alt: <[^>]+>$/);
    });

    it('should anonymize: Telegram username (@cool_user_99)', async () => {
      const input = 'Telegram: @cool_user_99';
      const result = await service.anonymize(
        COMPLIANCE_FRAMEWORKS.GDPR_EU,
        input,
      );
      expect(result.anonymizedText).toMatch(/^Telegram: <[^>]+>$/);
    });

    it('should anonymize: john.doe@company.com', async () => {
      const input = 'Email me at john.doe@company.com.';
      const result = await service.anonymize(
        COMPLIANCE_FRAMEWORKS.GDPR_EU,
        input,
      );
      expect(result.anonymizedText).toMatch(/^Email me at <[^>]+>\.$/);
    });

    it('should anonymize: +1 (555) 987-6543', async () => {
      const input = 'Call +1 (555) 987-6543 anytime.';
      const result = await service.anonymize(
        COMPLIANCE_FRAMEWORKS.GDPR_EU,
        input,
      );
      expect(result.anonymizedText).toMatch(/^Call <[^>]+> anytime\.$/);
    });

    it('should anonymize: support@example.co.uk', async () => {
      const input = 'Contact support@example.co.uk for help.';
      const result = await service.anonymize(
        COMPLIANCE_FRAMEWORKS.GDPR_EU,
        input,
      );
      expect(result.anonymizedText).toMatch(/^Contact <[^>]+> for help\.$/);
    });

    it('should anonymize: 0044 121 555 0199', async () => {
      const input = 'Tel: 0044 121 555 0199 during business hours.';
      const result = await service.anonymize(
        COMPLIANCE_FRAMEWORKS.GDPR_EU,
        input,
      );
      expect(result.anonymizedText).toMatch(
        /^Tel: <[^>]+> during business hours\.$/,
      );
    });

    it('should anonymize: @twitter_handle_123', async () => {
      const input = 'Follow us @twitter_handle_123 online.';
      const result = await service.anonymize(
        COMPLIANCE_FRAMEWORKS.GDPR_EU,
        input,
      );
      expect(result.anonymizedText).toMatch(/^Follow us <[^>]+> online\.$/);
    });

    it('should anonymize: alice_smith+tag@gmail.com', async () => {
      const input = 'Send to alice_smith+tag@gmail.com please.';
      const result = await service.anonymize(
        COMPLIANCE_FRAMEWORKS.GDPR_EU,
        input,
      );
      expect(result.anonymizedText).toMatch(/^Send to <[^>]+> please\.$/);
    });

    it('should anonymize: +86 10 8888 8888', async () => {
      const input = 'Reach us at +86 10 8888 8888.';
      const result = await service.anonymize(
        COMPLIANCE_FRAMEWORKS.GDPR_EU,
        input,
      );
      expect(result.anonymizedText).toMatch(/^Reach us at <[^>]+>\.$/);
    });

    it('should anonymize: info_service@domain.org', async () => {
      const input = 'Write to info_service@domain.org.';
      const result = await service.anonymize(
        COMPLIANCE_FRAMEWORKS.GDPR_EU,
        input,
      );
      expect(result.anonymizedText).toMatch(/^Write to <[^>]+>\.$/);
    });

    it('should anonymize: (234) 567-8901', async () => {
      const input = 'Phone (234) 567-8901 for questions.';
      const result = await service.anonymize(
        COMPLIANCE_FRAMEWORKS.GDPR_EU,
        input,
      );
      expect(result.anonymizedText).toMatch(/^Phone <[^>]+> for questions\.$/);
    });

    it('should anonymize: @instagram_brand_2024', async () => {
      const input = 'DM @instagram_brand_2024 directly.';
      const result = await service.anonymize(
        COMPLIANCE_FRAMEWORKS.GDPR_EU,
        input,
      );
      expect(result.anonymizedText).toMatch(/^DM <[^>]+> directly\.$/);
    });

    it('should anonymize: contact_us@services-worldwide.net', async () => {
      const input = 'Query contact_us@services-worldwide.net today.';
      const result = await service.anonymize(
        COMPLIANCE_FRAMEWORKS.GDPR_EU,
        input,
      );
      expect(result.anonymizedText).toMatch(/^Query <[^>]+> today\.$/);
    });

    it('should anonymize: +33 1 42 68 53 00', async () => {
      const input = 'Appel +33 1 42 68 53 00 maintenant.';
      const result = await service.anonymize(
        COMPLIANCE_FRAMEWORKS.GDPR_EU,
        input,
      );
      expect(result.anonymizedText).toMatch(/^Appel <[^>]+> maintenant\.$/);
    });

    it('should anonymize: user.name.long@subdomain.co.jp', async () => {
      const input = 'Send document to user.name.long@subdomain.co.jp.';
      const result = await service.anonymize(
        COMPLIANCE_FRAMEWORKS.GDPR_EU,
        input,
      );
      expect(result.anonymizedText).toMatch(/^Send document to <[^>]+>\.$/);
    });

    it('should anonymize: 91 22 1234 5678', async () => {
      const input = 'Call 91 22 1234 5678 between 9-5.';
      const result = await service.anonymize(
        COMPLIANCE_FRAMEWORKS.GDPR_EU,
        input,
      );
      expect(result.anonymizedText).toMatch(/^Call <[^>]+> between 9-5\.$/);
    });

    it('should anonymize: @tiktok_star_official', async () => {
      const input = 'Subscribe to @tiktok_star_official channel.';
      const result = await service.anonymize(
        COMPLIANCE_FRAMEWORKS.GDPR_EU,
        input,
      );
      expect(result.anonymizedText).toMatch(/^Subscribe to <[^>]+> channel\.$/);
    });

    it('should anonymize: hello123@outlook.com', async () => {
      const input = 'Connect via hello123@outlook.com.';
      const result = await service.anonymize(
        COMPLIANCE_FRAMEWORKS.GDPR_EU,
        input,
      );
      expect(result.anonymizedText).toMatch(/^Connect via <[^>]+>\.$/);
    });

    it('should anonymize: +7 (495) 123-45-67', async () => {
      const input = 'Ring +7 (495) 123-45-67 now.';
      const result = await service.anonymize(
        COMPLIANCE_FRAMEWORKS.GDPR_EU,
        input,
      );
      expect(result.anonymizedText).toMatch(/^Ring <[^>]+> now\.$/);
    });

    it('should anonymize: business.inquiry@tech-startup.io', async () => {
      const input = 'Partnership inquiry business.inquiry@tech-startup.io.';
      const result = await service.anonymize(
        COMPLIANCE_FRAMEWORKS.GDPR_EU,
        input,
      );
      expect(result.anonymizedText).toMatch(/^Partnership inquiry <[^>]+>\.$/);
    });

    it('should anonymize: 001-555-123-4567', async () => {
      const input = 'International 001-555-123-4567 toll-free.';
      const result = await service.anonymize(
        COMPLIANCE_FRAMEWORKS.GDPR_EU,
        input,
      );
      expect(result.anonymizedText).toMatch(
        /^International <[^>]+> toll-free\.$/,
      );
    });

    it('should anonymize: @linkedin_profile_name', async () => {
      const input = 'Connect @linkedin_profile_name professionally.';
      const result = await service.anonymize(
        COMPLIANCE_FRAMEWORKS.GDPR_EU,
        input,
      );
      expect(result.anonymizedText).toMatch(
        /^Connect <[^>]+> professionally\.$/,
      );
    });

    it('should anonymize: notifications@platform.app', async () => {
      const input = 'Notifications from notifications@platform.app received.';
      const result = await service.anonymize(
        COMPLIANCE_FRAMEWORKS.GDPR_EU,
        input,
      );
      expect(result.anonymizedText).toMatch(
        /^Notifications from <[^>]+> received\.$/,
      );
    });

    it('should anonymize: +61 2 9876 5432', async () => {
      const input = 'Contact +61 2 9876 5432 Sydney.';
      const result = await service.anonymize(
        COMPLIANCE_FRAMEWORKS.GDPR_EU,
        input,
      );
      expect(result.anonymizedText).toMatch(/^Contact <[^>]+> Sydney\.$/);
    });

    it('should anonymize: support_team_admin@company.biz', async () => {
      const input = 'Admin contact support_team_admin@company.biz here.';
      const result = await service.anonymize(
        COMPLIANCE_FRAMEWORKS.GDPR_EU,
        input,
      );
      expect(result.anonymizedText).toMatch(/^Admin contact <[^>]+> here\.$/);
    });

    it('should anonymize: 55 (11) 99999-9999', async () => {
      const input = 'WhatsApp 55 (11) 99999-9999 Brasil.';
      const result = await service.anonymize(
        COMPLIANCE_FRAMEWORKS.GDPR_EU,
        input,
      );
      expect(result.anonymizedText).toMatch(/^WhatsApp <[^>]+> Brasil\.$/);
    });

    it('should anonymize: @youtube_channel_official', async () => {
      const input = 'Subscribe @youtube_channel_official now.';
      const result = await service.anonymize(
        COMPLIANCE_FRAMEWORKS.GDPR_EU,
        input,
      );
      expect(result.anonymizedText).toMatch(/^Subscribe <[^>]+> now\.$/);
    });

    it('should anonymize: press@media-house.com', async () => {
      const input = 'Media inquiries press@media-house.com only.';
      const result = await service.anonymize(
        COMPLIANCE_FRAMEWORKS.GDPR_EU,
        input,
      );
      expect(result.anonymizedText).toMatch(/^Media inquiries <[^>]+> only\.$/);
    });

    it('should anonymize: +49 30 12345 6789', async () => {
      const input = 'Berlin office +49 30 12345 6789 available.';
      const result = await service.anonymize(
        COMPLIANCE_FRAMEWORKS.GDPR_EU,
        input,
      );
      expect(result.anonymizedText).toMatch(
        /^Berlin office <[^>]+> available\.$/,
      );
    });

    it('should anonymize: contact@creative-agency.studio', async () => {
      const input = 'Projects contact@creative-agency.studio here.';
      const result = await service.anonymize(
        COMPLIANCE_FRAMEWORKS.GDPR_EU,
        input,
      );
      expect(result.anonymizedText).toMatch(/^Projects <[^>]+> here\.$/);
    });

    it('should anonymize: +1-800-CALL-NOW', async () => {
      const input = 'Toll free +1-800-CALL-NOW number.';
      const result = await service.anonymize(
        COMPLIANCE_FRAMEWORKS.GDPR_EU,
        input,
      );
      expect(result.anonymizedText).toMatch(/^Toll free <[^>]+> number\.$/);
    });

    it('should anonymize: @facebook_community_page', async () => {
      const input = 'Join @facebook_community_page today.';
      const result = await service.anonymize(
        COMPLIANCE_FRAMEWORKS.GDPR_EU,
        input,
      );
      expect(result.anonymizedText).toMatch(/^Join <[^>]+> today\.$/);
    });

    it('should anonymize: orders@ecommerce-store.shop', async () => {
      const input = 'Order status orders@ecommerce-store.shop confirms.';
      const result = await service.anonymize(
        COMPLIANCE_FRAMEWORKS.GDPR_EU,
        input,
      );
      expect(result.anonymizedText).toMatch(
        /^Order status <[^>]+> confirms\.$/,
      );
    });

    it('should anonymize: +82 2 123 4567', async () => {
      const input = 'Seoul office +82 2 123 4567 line.';
      const result = await service.anonymize(
        COMPLIANCE_FRAMEWORKS.GDPR_EU,
        input,
      );
      expect(result.anonymizedText).toMatch(/^Seoul office <[^>]+> line\.$/);
    });

    it('should anonymize: help_desk@solutions.company', async () => {
      const input = 'Tickets help_desk@solutions.company submit.';
      const result = await service.anonymize(
        COMPLIANCE_FRAMEWORKS.GDPR_EU,
        input,
      );
      expect(result.anonymizedText).toMatch(/^Tickets <[^>]+> submit\.$/);
    });

    it('should anonymize: +52 55 1234 5678', async () => {
      const input = 'Mexico City +52 55 1234 5678 hotline.';
      const result = await service.anonymize(
        COMPLIANCE_FRAMEWORKS.GDPR_EU,
        input,
      );
      expect(result.anonymizedText).toMatch(/^Mexico City <[^>]+> hotline\.$/);
    });

    it('should anonymize: @telegram_official_bot', async () => {
      const input = 'Message @telegram_official_bot directly.';
      const result = await service.anonymize(
        COMPLIANCE_FRAMEWORKS.GDPR_EU,
        input,
      );
      expect(result.anonymizedText).toMatch(/^Message <[^>]+> directly\.$/);
    });

    it('should anonymize: feedback@innovation-labs.tech', async () => {
      const input = 'Feedback feedback@innovation-labs.tech welcome.';
      const result = await service.anonymize(
        COMPLIANCE_FRAMEWORKS.GDPR_EU,
        input,
      );
      expect(result.anonymizedText).toMatch(/^Feedback <[^>]+> welcome\.$/);
    });

    it('should anonymize: +39 06 6789 0123', async () => {
      const input = 'Roma Italia +39 06 6789 0123.';
      const result = await service.anonymize(
        COMPLIANCE_FRAMEWORKS.GDPR_EU,
        input,
      );
      expect(result.anonymizedText).toMatch(/^Roma Italia <[^>]+>\.$/);
    });

    it('should anonymize: @discord_server_community', async () => {
      const input = 'Gaming @discord_server_community join.';
      const result = await service.anonymize(
        COMPLIANCE_FRAMEWORKS.GDPR_EU,
        input,
      );
      expect(result.anonymizedText).toMatch(/^Gaming <[^>]+> join\.$/);
    });

    it('should anonymize: careers@future-company.jobs', async () => {
      const input = 'Applications careers@future-company.jobs sent.';
      const result = await service.anonymize(
        COMPLIANCE_FRAMEWORKS.GDPR_EU,
        input,
      );
      expect(result.anonymizedText).toMatch(/^Applications <[^>]+> sent\.$/);
    });
  });
};

export default runContactTestsGDPR;
