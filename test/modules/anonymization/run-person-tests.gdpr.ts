import { COMPLIANCE_FRAMEWORKS } from '@common/constants';
import AnonymizationService from '../../../src/modules/anonymization/anonymization.service';

const runPersonTestsGDPR = (getService: () => AnonymizationService) => {
  describe('GDPR person anonymization (names)', () => {
    let service: AnonymizationService;

    beforeEach(() => {
      service = getService();
    });

    it('should anonymize a long sentence containing multiple names', async () => {
      const input =
        'My name is Alexander Ivan Petrenko, but some people call me Alex, others write A. Petrenko or even Oleksandr I. Petrenko, while my mom Maria Kovalchuk (sometimes Maria Petrenko after marriage) still signs as M. Kovalchuk-Petrenko in some documents.';

      const result = await service.anonymize(
        COMPLIANCE_FRAMEWORKS.GDPR_EU,
        input,
      );

      const regex =
        /^My name is <[^>]+>, but some people call me <[^>]+>, others write <[^>]+> or even <[^>]+>, while my mom <[^>]+> \(sometimes <[^>]+> after marriage\) still signs as <[^>]+> in some documents\.$/;

      expect(result.anonymizedText).toMatch(regex);
    });

    it('should anonymize: John Smith', async () => {
      const input = 'Hi, I am John Smith.';
      const result = await service.anonymize(
        COMPLIANCE_FRAMEWORKS.GDPR_EU,
        input,
      );
      expect(result.anonymizedText).toMatch(/^Hi, I am <[^>]+>\.$/);
    });

    it('should anonymize: Wei Zhang', async () => {
      const input = 'My name is Wei Zhang and I live here.';
      const result = await service.anonymize(
        COMPLIANCE_FRAMEWORKS.GDPR_EU,
        input,
      );
      expect(result.anonymizedText).toMatch(
        /^My name is <[^>]+> and I live here\.$/,
      );
    });

    it('should anonymize: Arabic name', async () => {
      const input = 'This is Ahmed Mohamed speaking.';
      const result = await service.anonymize(
        COMPLIANCE_FRAMEWORKS.GDPR_EU,
        input,
      );
      expect(result.anonymizedText).toMatch(/^This is <[^>]+> speaking\.$/);
    });

    it('should anonymize: Jean-Luc Picard', async () => {
      const input = 'I am Jean-Luc Picard, nice to meet you.';
      const result = await service.anonymize(
        COMPLIANCE_FRAMEWORKS.GDPR_EU,
        input,
      );
      expect(result.anonymizedText).toMatch(
        /^I am <[^>]+>, nice to meet you\.$/,
      );
    });

    it('should anonymize: María-José Carreño Quiñones', async () => {
      const input = 'Call me María-José Carreño Quiñones.';
      const result = await service.anonymize(
        COMPLIANCE_FRAMEWORKS.GDPR_EU,
        input,
      );
      expect(result.anonymizedText).toMatch(/^Call me <[^>]+>\.$/);
    });

    it('should anonymize: Muhammad Ali', async () => {
      const input = 'Hello, my name is Muhammad Ali.';
      const result = await service.anonymize(
        COMPLIANCE_FRAMEWORKS.GDPR_EU,
        input,
      );
      expect(result.anonymizedText).toMatch(/^Hello, my name is <[^>]+>\.$/);
    });

    it('should anonymize: Maria Garcia', async () => {
      const input = 'This is Maria Garcia speaking.';
      const result = await service.anonymize(
        COMPLIANCE_FRAMEWORKS.GDPR_EU,
        input,
      );
      expect(result.anonymizedText).toMatch(/^This is <[^>]+> speaking\.$/);
    });

    it('should anonymize: Wei Chen', async () => {
      const input = 'I am Wei Chen from the office.';
      const result = await service.anonymize(
        COMPLIANCE_FRAMEWORKS.GDPR_EU,
        input,
      );
      expect(result.anonymizedText).toMatch(/^I am <[^>]+> from the office\.$/);
    });

    it('should anonymize: John Williams', async () => {
      const input = 'John Williams submitted the report.';
      const result = await service.anonymize(
        COMPLIANCE_FRAMEWORKS.GDPR_EU,
        input,
      );
      expect(result.anonymizedText).toMatch(/^<[^>]+> submitted the report\.$/);
    });

    it('should anonymize: Priya Sharma', async () => {
      const input = 'Priya Sharma confirmed the booking.';
      const result = await service.anonymize(
        COMPLIANCE_FRAMEWORKS.GDPR_EU,
        input,
      );
      expect(result.anonymizedText).toMatch(
        /^<[^>]+> confirmed the booking\.$/,
      );
    });

    it('should anonymize: Luka Petrović', async () => {
      const input = 'My neighbor is Luka Petrović.';
      const result = await service.anonymize(
        COMPLIANCE_FRAMEWORKS.GDPR_EU,
        input,
      );
      expect(result.anonymizedText).toMatch(/^My neighbor is <[^>]+>\.$/);
    });

    it('should anonymize: Yuki Nakamura', async () => {
      const input = 'Yuki Nakamura joined the meeting.';
      const result = await service.anonymize(
        COMPLIANCE_FRAMEWORKS.GDPR_EU,
        input,
      );
      expect(result.anonymizedText).toMatch(/^<[^>]+> joined the meeting\.$/);
    });

    it('should anonymize: Fatoumata Diallo', async () => {
      const input = 'Fatoumata Diallo signed the document.';
      const result = await service.anonymize(
        COMPLIANCE_FRAMEWORKS.GDPR_EU,
        input,
      );
      expect(result.anonymizedText).toMatch(/^<[^>]+> signed the document\.$/);
    });

    it('should anonymize: Thiago Oliveira', async () => {
      const input = 'Thiago Oliveira called earlier.';
      const result = await service.anonymize(
        COMPLIANCE_FRAMEWORKS.GDPR_EU,
        input,
      );
      expect(result.anonymizedText).toMatch(/^<[^>]+> called earlier\.$/);
    });

    it('should anonymize: Eszter Kovács', async () => {
      const input = 'Eszter Kovács will arrive tomorrow.';
      const result = await service.anonymize(
        COMPLIANCE_FRAMEWORKS.GDPR_EU,
        input,
      );
      expect(result.anonymizedText).toMatch(/^<[^>]+> will arrive tomorrow\.$/);
    });

    it('should anonymize: Nkosazana Dlamini', async () => {
      const input = 'Nkosazana Dlamini approved the request.';
      const result = await service.anonymize(
        COMPLIANCE_FRAMEWORKS.GDPR_EU,
        input,
      );
      expect(result.anonymizedText).toMatch(/^<[^>]+> approved the request\.$/);
    });

    it('should anonymize: Oleksii Bondarenko', async () => {
      const input = 'Oleksii Bondarenko updated the records.';
      const result = await service.anonymize(
        COMPLIANCE_FRAMEWORKS.GDPR_EU,
        input,
      );
      expect(result.anonymizedText).toMatch(/^<[^>]+> updated the records\.$/);
    });

    it('should anonymize: Aisling Murphy', async () => {
      const input = 'Aisling Murphy answered the phone.';
      const result = await service.anonymize(
        COMPLIANCE_FRAMEWORKS.GDPR_EU,
        input,
      );
      expect(result.anonymizedText).toMatch(/^<[^>]+> answered the phone\.$/);
    });

    it('should anonymize: Levan Beridze', async () => {
      const input = 'Levan Beridze prepared the presentation.';
      const result = await service.anonymize(
        COMPLIANCE_FRAMEWORKS.GDPR_EU,
        input,
      );
      expect(result.anonymizedText).toMatch(
        /^<[^>]+> prepared the presentation\.$/,
      );
    });

    it('should anonymize: Noor Al-Hassan', async () => {
      const input = 'Noor Al-Hassan sent an email.';
      const result = await service.anonymize(
        COMPLIANCE_FRAMEWORKS.GDPR_EU,
        input,
      );
      expect(result.anonymizedText).toMatch(/^<[^>]+> sent an email\.$/);
    });

    it('should anonymize: Tenzin Gyatso', async () => {
      const input = 'Tenzin Gyatso booked the tickets.';
      const result = await service.anonymize(
        COMPLIANCE_FRAMEWORKS.GDPR_EU,
        input,
      );
      expect(result.anonymizedText).toMatch(/^<[^>]+> booked the tickets\.$/);
    });

    it('should anonymize: Milagros Quispe', async () => {
      const input = 'Milagros Quispe completed the application.';
      const result = await service.anonymize(
        COMPLIANCE_FRAMEWORKS.GDPR_EU,
        input,
      );
      expect(result.anonymizedText).toMatch(
        /^<[^>]+> completed the application\.$/,
      );
    });

    it('should anonymize: Szymon Wojciechowski', async () => {
      const input = 'Szymon Wojciechowski confirmed attendance.';
      const result = await service.anonymize(
        COMPLIANCE_FRAMEWORKS.GDPR_EU,
        input,
      );
      expect(result.anonymizedText).toMatch(/^<[^>]+> confirmed attendance\.$/);
    });

    it('should anonymize: Anahit Mkrtchyan', async () => {
      const input = 'Anahit Mkrtchyan delivered the package.';
      const result = await service.anonymize(
        COMPLIANCE_FRAMEWORKS.GDPR_EU,
        input,
      );
      expect(result.anonymizedText).toMatch(
        /^<[^>]+> delivered the package\.$/,
      );
    });

    it('should anonymize: Bùi Minh Khang', async () => {
      const input = 'Bùi Minh Khang updated the system.';
      const result = await service.anonymize(
        COMPLIANCE_FRAMEWORKS.GDPR_EU,
        input,
      );
      expect(result.anonymizedText).toMatch(/^<[^>]+> updated the system\.$/);
    });

    it('should anonymize: Zbigniew Brzęczyszczykiewicz', async () => {
      const input = 'Zbigniew Brzęczyszczykiewicz registered the account.';
      const result = await service.anonymize(
        COMPLIANCE_FRAMEWORKS.GDPR_EU,
        input,
      );
      expect(result.anonymizedText).toMatch(
        /^<[^>]+> registered the account\.$/,
      );
    });

    it('should anonymize: Chukwuebuka Nwankwo', async () => {
      const input = 'Chukwuebuka Nwankwo called support.';
      const result = await service.anonymize(
        COMPLIANCE_FRAMEWORKS.GDPR_EU,
        input,
      );
      expect(result.anonymizedText).toMatch(/^<[^>]+> called support\.$/);
    });

    it('should anonymize: Xochitl Tecuapetla', async () => {
      const input = 'Xochitl Tecuapetla sent the invoice.';
      const result = await service.anonymize(
        COMPLIANCE_FRAMEWORKS.GDPR_EU,
        input,
      );
      expect(result.anonymizedText).toMatch(/^<[^>]+> sent the invoice\.$/);
    });

    it('should anonymize: Guðrún Þorsteinsdóttir', async () => {
      const input = 'Guðrún Þorsteinsdóttir attended remotely.';
      const result = await service.anonymize(
        COMPLIANCE_FRAMEWORKS.GDPR_EU,
        input,
      );
      expect(result.anonymizedText).toMatch(/^<[^>]+> attended remotely\.$/);
    });

    it('should anonymize: Nqobile Khumalo', async () => {
      const input = 'Nqobile Khumalo reviewed the files.';
      const result = await service.anonymize(
        COMPLIANCE_FRAMEWORKS.GDPR_EU,
        input,
      );
      expect(result.anonymizedText).toMatch(/^<[^>]+> reviewed the files\.$/);
    });

    it('should anonymize: Cătălin Rădulescu', async () => {
      const input = 'Cătălin Rădulescu updated the contract.';
      const result = await service.anonymize(
        COMPLIANCE_FRAMEWORKS.GDPR_EU,
        input,
      );
      expect(result.anonymizedText).toMatch(/^<[^>]+> updated the contract\.$/);
    });

    it('should anonymize: Tshering Wangchuk', async () => {
      const input = 'Tshering Wangchuk confirmed the reservation.';
      const result = await service.anonymize(
        COMPLIANCE_FRAMEWORKS.GDPR_EU,
        input,
      );
      expect(result.anonymizedText).toMatch(
        /^<[^>]+> confirmed the reservation\.$/,
      );
    });

    it('should anonymize: Yared Tesfaye', async () => {
      const input = 'Yared Tesfaye answered the survey.';
      const result = await service.anonymize(
        COMPLIANCE_FRAMEWORKS.GDPR_EU,
        input,
      );
      expect(result.anonymizedText).toMatch(/^<[^>]+> answered the survey\.$/);
    });

    it('should anonymize: Batsaikhan Erdenebat', async () => {
      const input = 'Batsaikhan Erdenebat filed the report.';
      const result = await service.anonymize(
        COMPLIANCE_FRAMEWORKS.GDPR_EU,
        input,
      );
      expect(result.anonymizedText).toMatch(/^<[^>]+> filed the report\.$/);
    });

    it('should anonymize: Eirini Papadopoulou', async () => {
      const input = 'Eirini Papadopoulou sent a reminder.';
      const result = await service.anonymize(
        COMPLIANCE_FRAMEWORKS.GDPR_EU,
        input,
      );
      expect(result.anonymizedText).toMatch(/^<[^>]+> sent a reminder\.$/);
    });

    it('should anonymize: Sibusisiwe Mthembu', async () => {
      const input = 'Sibusisiwe Mthembu requested assistance.';
      const result = await service.anonymize(
        COMPLIANCE_FRAMEWORKS.GDPR_EU,
        input,
      );
      expect(result.anonymizedText).toMatch(/^<[^>]+> requested assistance\.$/);
    });

    it('should anonymize: Dmytro Yatseniuk', async () => {
      const input = 'Dmytro Yatseniuk updated the database.';
      const result = await service.anonymize(
        COMPLIANCE_FRAMEWORKS.GDPR_EU,
        input,
      );
      expect(result.anonymizedText).toMatch(/^<[^>]+> updated the database\.$/);
    });

    it('should anonymize: Aroha Ngata', async () => {
      const input = 'Aroha Ngata completed the interview.';
      const result = await service.anonymize(
        COMPLIANCE_FRAMEWORKS.GDPR_EU,
        input,
      );
      expect(result.anonymizedText).toMatch(
        /^<[^>]+> completed the interview\.$/,
      );
    });

    it('should anonymize: Külli Pärn', async () => {
      const input = 'Külli Pärn approved the payment.';
      const result = await service.anonymize(
        COMPLIANCE_FRAMEWORKS.GDPR_EU,
        input,
      );
      expect(result.anonymizedText).toMatch(/^<[^>]+> approved the payment\.$/);
    });

    it('should anonymize: János Székely', async () => {
      const input = 'János Székely updated the schedule.';
      const result = await service.anonymize(
        COMPLIANCE_FRAMEWORKS.GDPR_EU,
        input,
      );
      expect(result.anonymizedText).toMatch(/^<[^>]+> updated the schedule\.$/);
    });

    it('should anonymize: Vusumuzi Nxumalo', async () => {
      const input = 'Vusumuzi Nxumalo answered the request.';
      const result = await service.anonymize(
        COMPLIANCE_FRAMEWORKS.GDPR_EU,
        input,
      );
      expect(result.anonymizedText).toMatch(/^<[^>]+> answered the request\.$/);
    });

    it('should anonymize: Soraya Benjelloun', async () => {
      const input = 'Soraya Benjelloun submitted the paperwork.';
      const result = await service.anonymize(
        COMPLIANCE_FRAMEWORKS.GDPR_EU,
        input,
      );
      expect(result.anonymizedText).toMatch(
        /^<[^>]+> submitted the paperwork\.$/,
      );
    });

    it('should anonymize: Tlaloc Xiuhtécatl', async () => {
      const input = 'Tlaloc Xiuhtécatl joined the conference call.';
      const result = await service.anonymize(
        COMPLIANCE_FRAMEWORKS.GDPR_EU,
        input,
      );
      expect(result.anonymizedText).toMatch(
        /^<[^>]+> joined the conference call\.$/,
      );
    });

    it('should anonymize: Ragnheiður Jónsdóttir', async () => {
      const input = 'Ragnheiður Jónsdóttir reviewed the application.';
      const result = await service.anonymize(
        COMPLIANCE_FRAMEWORKS.GDPR_EU,
        input,
      );
      expect(result.anonymizedText).toMatch(
        /^<[^>]+> reviewed the application\.$/,
      );
    });

    it('should anonymize: Chimwemwe Banda', async () => {
      const input = 'Chimwemwe Banda confirmed the shipment.';
      const result = await service.anonymize(
        COMPLIANCE_FRAMEWORKS.GDPR_EU,
        input,
      );
      expect(result.anonymizedText).toMatch(
        /^<[^>]+> confirmed the shipment\.$/,
      );
    });
  });
};

export default runPersonTestsGDPR;
