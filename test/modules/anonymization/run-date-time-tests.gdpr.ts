import { COMPLIANCE_FRAMEWORKS } from '@common/constants';
import AnonymizationService from '../../../src/modules/anonymization/anonymization.service';

const runDateTimeTestsGDPR = (getService: () => AnonymizationService) => {
  describe('GDPR date/time anonymization', () => {
    let service: AnonymizationService;

    beforeEach(() => {
      service = getService();
    });

    it('should anonymize a long sentence containing multiple date/time types', async () => {
      const input =
        'I was born on January 5th, 2001, or 05/01/2001 depending on the format, sometime around 3:45 PM, though my records also show 15:45 or even just “early afternoon Q1 2001.”';

      const result = await service.anonymize(
        COMPLIANCE_FRAMEWORKS.GDPR_EU,
        input,
      );

      const regex =
        /^I was born on <[^>]+>, or <[^>]+> depending on the format, sometime <[^>]+>, though my records also show <[^>]+> or even just “<[^>]+>.”$/;

      expect(result.anonymizedText).toMatch(regex);
    });

    it('should anonymize: 11:59 PM', async () => {
      const input = 'Meeting at 11:59 PM.';
      const result = await service.anonymize(
        COMPLIANCE_FRAMEWORKS.GDPR_EU,
        input,
      );
      expect(result.anonymizedText).toMatch(/^Meeting at <[^>]+>\.$/);
    });

    it('should anonymize: 12/31/2024', async () => {
      const input = 'Meeting on 12/31/2024.';
      const result = await service.anonymize(
        COMPLIANCE_FRAMEWORKS.GDPR_EU,
        input,
      );
      expect(result.anonymizedText).toMatch(/^Meeting on <[^>]+>\.$/);
    });

    it('should anonymize: CET format (31.12.2024 23:59 CET)', async () => {
      const input = 'Event: 31.12.2024 23:59 CET.';
      const result = await service.anonymize(
        COMPLIANCE_FRAMEWORKS.GDPR_EU,
        input,
      );
      expect(result.anonymizedText).toMatch(/^Event: <[^>]+>\.$/);
    });

    it('should anonymize: ISO datetime (2024-12-31T23:59:00+09:00)', async () => {
      const input = 'Scheduled for 2024-12-31T23:59:00+09:00.';
      const result = await service.anonymize(
        COMPLIANCE_FRAMEWORKS.GDPR_EU,
        input,
      );
      expect(result.anonymizedText).toMatch(/^Scheduled for <[^>]+>\.$/);
    });

    it('should anonymize: Hijri date (1446-09-01)', async () => {
      const input = 'Date is 1446-09-01 (Hijri).';
      const result = await service.anonymize(
        COMPLIANCE_FRAMEWORKS.GDPR_EU,
        input,
      );
      expect(result.anonymizedText).toMatch(/^Date is <[^>]+> \(Hijri\)\.$/);
    });

    it('should anonymize: UTC offset time (10:30 UTC+5:30)', async () => {
      const input = 'Happening at 10:30 UTC+5:30.';
      const result = await service.anonymize(
        COMPLIANCE_FRAMEWORKS.GDPR_EU,
        input,
      );
      expect(result.anonymizedText).toMatch(/^Happening at <[^>]+>\.$/);
    });

    it('should anonymize: 03:45 AM', async () => {
      const input = 'Meeting scheduled at 03:45 AM.';
      const result = await service.anonymize(
        COMPLIANCE_FRAMEWORKS.GDPR_EU,
        input,
      );
      expect(result.anonymizedText).toMatch(/^Meeting scheduled at <[^>]+>\.$/);
    });

    it('should anonymize: 15:30 (24-hour)', async () => {
      const input = 'Conference starts at 15:30 sharp.';
      const result = await service.anonymize(
        COMPLIANCE_FRAMEWORKS.GDPR_EU,
        input,
      );
      expect(result.anonymizedText).toMatch(
        /^Conference starts at <[^>]+> sharp\.$/,
      );
    });

    it('should anonymize: January 15, 2023', async () => {
      const input = 'Event held on January 15, 2023.';
      const result = await service.anonymize(
        COMPLIANCE_FRAMEWORKS.GDPR_EU,
        input,
      );
      expect(result.anonymizedText).toMatch(/^Event held on <[^>]+>\.$/);
    });

    it('should anonymize: 15/01/2023', async () => {
      const input = 'Date format 15/01/2023 used in records.';
      const result = await service.anonymize(
        COMPLIANCE_FRAMEWORKS.GDPR_EU,
        input,
      );
      expect(result.anonymizedText).toMatch(
        /^Date format <[^>]+> used in records\.$/,
      );
    });

    it('should anonymize: 2023-01-15T14:30:00Z', async () => {
      const input = 'Timestamp 2023-01-15T14:30:00Z recorded.';
      const result = await service.anonymize(
        COMPLIANCE_FRAMEWORKS.GDPR_EU,
        input,
      );
      expect(result.anonymizedText).toMatch(/^Timestamp <[^>]+> recorded\.$/);
    });

    it('should anonymize: Monday, March 6, 2023', async () => {
      const input = 'Training on Monday, March 6, 2023 scheduled.';
      const result = await service.anonymize(
        COMPLIANCE_FRAMEWORKS.GDPR_EU,
        input,
      );
      expect(result.anonymizedText).toMatch(
        /^Training on <[^>]+> scheduled\.$/,
      );
    });

    it('should anonymize: 06.03.2023 09:15', async () => {
      const input = 'Appointment at 06.03.2023 09:15 confirmed.';
      const result = await service.anonymize(
        COMPLIANCE_FRAMEWORKS.GDPR_EU,
        input,
      );
      expect(result.anonymizedText).toMatch(
        /^Appointment at <[^>]+> confirmed\.$/,
      );
    });

    it('should anonymize: Q2 2024', async () => {
      const input = 'Project deadline is Q2 2024.';
      const result = await service.anonymize(
        COMPLIANCE_FRAMEWORKS.GDPR_EU,
        input,
      );
      expect(result.anonymizedText).toMatch(/^Project deadline is <[^>]+>\.$/);
    });

    it('should anonymize: 10:30 EST', async () => {
      const input = 'Call at 10:30 EST tomorrow.';
      const result = await service.anonymize(
        COMPLIANCE_FRAMEWORKS.GDPR_EU,
        input,
      );
      expect(result.anonymizedText).toMatch(/^Call at <[^>]+> tomorrow\.$/);
    });

    it('should anonymize: 1446-06-15 (Hijri date)', async () => {
      const input = 'Festival on 1446-06-15 in the Islamic calendar.';
      const result = await service.anonymize(
        COMPLIANCE_FRAMEWORKS.GDPR_EU,
        input,
      );
      expect(result.anonymizedText).toMatch(
        /^Festival on <[^>]+> in the Islamic calendar\.$/,
      );
    });

    it('should anonymize: Thursday 2:00 PM', async () => {
      const input = 'Board meeting Thursday 2:00 PM.';
      const result = await service.anonymize(
        COMPLIANCE_FRAMEWORKS.GDPR_EU,
        input,
      );
      expect(result.anonymizedText).toMatch(/^Board meeting <[^>]+>\.$/);
    });

    it('should anonymize: 20231225 (compact date)', async () => {
      const input = 'Date code 20231225 entered in system.';
      const result = await service.anonymize(
        COMPLIANCE_FRAMEWORKS.GDPR_EU,
        input,
      );
      expect(result.anonymizedText).toMatch(
        /^Date code <[^>]+> entered in system\.$/,
      );
    });

    it('should anonymize: 23:59:59', async () => {
      const input = 'Deadline at 23:59:59 on Friday.';
      const result = await service.anonymize(
        COMPLIANCE_FRAMEWORKS.GDPR_EU,
        input,
      );
      expect(result.anonymizedText).toMatch(
        /^Deadline at <[^>]+> on Friday\.$/,
      );
    });

    it('should anonymize: 01-JAN-2025', async () => {
      const input = 'Contract expires 01-JAN-2025.';
      const result = await service.anonymize(
        COMPLIANCE_FRAMEWORKS.GDPR_EU,
        input,
      );
      expect(result.anonymizedText).toMatch(/^Contract expires <[^>]+>\.$/);
    });

    it('should anonymize: 17h45 (French format)', async () => {
      const input = 'Rendezvous at 17h45 on Boulevard.';
      const result = await service.anonymize(
        COMPLIANCE_FRAMEWORKS.GDPR_EU,
        input,
      );
      expect(result.anonymizedText).toMatch(
        /^Rendezvous at <[^>]+> on Boulevard\.$/,
      );
    });

    it('should anonymize: 2024-W15-3 (ISO week date)', async () => {
      const input = 'Sprint 2024-W15-3 commences today.';
      const result = await service.anonymize(
        COMPLIANCE_FRAMEWORKS.GDPR_EU,
        input,
      );
      expect(result.anonymizedText).toMatch(
        /^Sprint <[^>]+> commences today\.$/,
      );
    });

    it('should anonymize: 14h30 UTC+2', async () => {
      const input = 'Stream begins at 14h30 UTC+2.';
      const result = await service.anonymize(
        COMPLIANCE_FRAMEWORKS.GDPR_EU,
        input,
      );
      expect(result.anonymizedText).toMatch(/^Stream begins at <[^>]+>\.$/);
    });

    it('should anonymize: Dec. 31st at noon', async () => {
      const input = 'Celebration Dec. 31st at noon sharp.';
      const result = await service.anonymize(
        COMPLIANCE_FRAMEWORKS.GDPR_EU,
        input,
      );
      expect(result.anonymizedText).toMatch(/^Celebration <[^>]+> sharp\.$/);
    });

    it('should anonymize: 3:15pm PST', async () => {
      const input = 'Session at 3:15pm PST available.';
      const result = await service.anonymize(
        COMPLIANCE_FRAMEWORKS.GDPR_EU,
        input,
      );
      expect(result.anonymizedText).toMatch(/^Session at <[^>]+> available\.$/);
    });

    it('should anonymize: Summer 2025', async () => {
      const input = 'Internship begins Summer 2025.';
      const result = await service.anonymize(
        COMPLIANCE_FRAMEWORKS.GDPR_EU,
        input,
      );
      expect(result.anonymizedText).toMatch(/^Internship begins <[^>]+>\.$/);
    });

    it('should anonymize: 12:00:00 (midnight)', async () => {
      const input = 'Servers reset at 12:00:00 tonight.';
      const result = await service.anonymize(
        COMPLIANCE_FRAMEWORKS.GDPR_EU,
        input,
      );
      expect(result.anonymizedText).toMatch(
        /^Servers reset at <[^>]+> tonight\.$/,
      );
    });

    it('should anonymize: Friday the 13th, May 2023', async () => {
      const input = 'Event on Friday the 13th, May 2023.';
      const result = await service.anonymize(
        COMPLIANCE_FRAMEWORKS.GDPR_EU,
        input,
      );
      expect(result.anonymizedText).toMatch(/^Event on <[^>]+>\.$/);
    });

    it('should anonymize: 07/04/2024 16:45:30', async () => {
      const input = 'Log timestamp 07/04/2024 16:45:30 recorded.';
      const result = await service.anonymize(
        COMPLIANCE_FRAMEWORKS.GDPR_EU,
        input,
      );
      expect(result.anonymizedText).toMatch(
        /^Log timestamp <[^>]+> recorded\.$/,
      );
    });

    it('should anonymize: Winter solstice 2024', async () => {
      const input = 'Celebration Winter solstice 2024 planned.';
      const result = await service.anonymize(
        COMPLIANCE_FRAMEWORKS.GDPR_EU,
        input,
      );
      expect(result.anonymizedText).toMatch(/^Celebration <[^>]+> planned\.$/);
    });

    it('should anonymize: 9 AM AEST', async () => {
      const input = 'Meeting 9 AM AEST confirmed.';
      const result = await service.anonymize(
        COMPLIANCE_FRAMEWORKS.GDPR_EU,
        input,
      );
      expect(result.anonymizedText).toMatch(/^Meeting <[^>]+> confirmed\.$/);
    });

    it('should anonymize: 2025-02-14', async () => {
      const input = 'Valentine event 2025-02-14 registered.';
      const result = await service.anonymize(
        COMPLIANCE_FRAMEWORKS.GDPR_EU,
        input,
      );
      expect(result.anonymizedText).toMatch(
        /^Valentine event <[^>]+> registered\.$/,
      );
    });

    it('should anonymize: 11 Ramadan 1446', async () => {
      const input = 'Iftar gathering 11 Ramadan 1446 announced.';
      const result = await service.anonymize(
        COMPLIANCE_FRAMEWORKS.GDPR_EU,
        input,
      );
      expect(result.anonymizedText).toMatch(
        /^Iftar gathering <[^>]+> announced\.$/,
      );
    });

    it('should anonymize: 18:20:45.123', async () => {
      const input = 'Event triggered at 18:20:45.123 UTC.';
      const result = await service.anonymize(
        COMPLIANCE_FRAMEWORKS.GDPR_EU,
        input,
      );
      expect(result.anonymizedText).toMatch(
        /^Event triggered at <[^>]+> UTC\.$/,
      );
    });

    it('should anonymize: Last day of March 2024', async () => {
      const input = 'Offer expires Last day of March 2024.';
      const result = await service.anonymize(
        COMPLIANCE_FRAMEWORKS.GDPR_EU,
        input,
      );
      expect(result.anonymizedText).toMatch(/^Offer expires <[^>]+>\.$/);
    });

    it('should anonymize: Epoch 1704067200', async () => {
      const input = 'Timestamp Epoch 1704067200 converted.';
      const result = await service.anonymize(
        COMPLIANCE_FRAMEWORKS.GDPR_EU,
        input,
      );
      expect(result.anonymizedText).toMatch(/^Timestamp <[^>]+> converted\.$/);
    });

    it('should anonymize: 04:00 UTC', async () => {
      const input = 'Backup at 04:00 UTC daily.';
      const result = await service.anonymize(
        COMPLIANCE_FRAMEWORKS.GDPR_EU,
        input,
      );
      expect(result.anonymizedText).toMatch(/^Backup at <[^>]+> daily\.$/);
    });

    it('should anonymize: Late evening on 5th December', async () => {
      const input = 'Party Late evening on 5th December.';
      const result = await service.anonymize(
        COMPLIANCE_FRAMEWORKS.GDPR_EU,
        input,
      );
      expect(result.anonymizedText).toMatch(/^Party <[^>]+>\.$/);
    });

    it('should anonymize: 2023 fiscal year ending', async () => {
      const input = 'Reporting for 2023 fiscal year ending.';
      const result = await service.anonymize(
        COMPLIANCE_FRAMEWORKS.GDPR_EU,
        input,
      );
      expect(result.anonymizedText).toMatch(/^Reporting for <[^>]+>\.$/);
    });

    it('should anonymize: 21:00 GMT', async () => {
      const input = 'Broadcast starts 21:00 GMT tonight.';
      const result = await service.anonymize(
        COMPLIANCE_FRAMEWORKS.GDPR_EU,
        input,
      );
      expect(result.anonymizedText).toMatch(
        /^Broadcast starts <[^>]+> tonight\.$/,
      );
    });

    it('should anonymize: Y2K25', async () => {
      const input = 'Bug tracking issue Y2K25.';
      const result = await service.anonymize(
        COMPLIANCE_FRAMEWORKS.GDPR_EU,
        input,
      );
      expect(result.anonymizedText).toMatch(/^Bug tracking issue <[^>]+>\.$/);
    });

    it('should anonymize: End of business day Friday', async () => {
      const input = 'Submit reports End of business day Friday.';
      const result = await service.anonymize(
        COMPLIANCE_FRAMEWORKS.GDPR_EU,
        input,
      );
      expect(result.anonymizedText).toMatch(/^Submit reports <[^>]+>\.$/);
    });

    it('should anonymize: 00:30 hours', async () => {
      const input = 'Night shift starts 00:30 hours.';
      const result = await service.anonymize(
        COMPLIANCE_FRAMEWORKS.GDPR_EU,
        input,
      );
      expect(result.anonymizedText).toMatch(/^Night shift starts <[^>]+>\.$/);
    });

    it('should anonymize: Vernal equinox 2024', async () => {
      const input = 'Celebration Vernal equinox 2024 planned.';
      const result = await service.anonymize(
        COMPLIANCE_FRAMEWORKS.GDPR_EU,
        input,
      );
      expect(result.anonymizedText).toMatch(/^Celebration <[^>]+> planned\.$/);
    });
  });
};

export default runDateTimeTestsGDPR;
