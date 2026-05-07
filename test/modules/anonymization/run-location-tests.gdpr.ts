import { Compliance } from '../../../src/common/constants';
import AnonymizationService from '../../../src/modules/anonymization/anonymization.service';

const runLocationTestsGDPR = (getService: () => AnonymizationService) => {
  describe('GDPR locations anonymization', () => {
    let service: AnonymizationService;

    beforeEach(() => {
      service = getService();
    });

    it('should anonymize a long sentence containing multiple locations', async () => {
      const input =
        'I live in Ukraine, in Cherkasy region, near a small village called Verbivka, although I used to say I’m from Central Europe, then Eastern Europe, and sometimes just “near Kyiv” even though it’s actually a few hours away.';

      const result = await service.anonymize(Compliance.GDPR, input);

      const regex =
        /^I live in <[^>]+>, in <[^>]+> region, near a small village called <[^>]+>, although I used to say I’m from <[^>]+>, then <[^>]+>, and sometimes just “near <[^>]+>” even though it’s actually <[^>]+> away\.$/;

      expect(result.anonymizedText).toMatch(regex);
    });

    it('should anonymize: Iceland', async () => {
      const input = 'Based somewhere in rural Iceland.';
      const result = await service.anonymize(Compliance.GDPR, input);
      expect(result.anonymizedText).toMatch(
        /^Based somewhere in rural <[^>]+>\.$/,
      );
    });

    it('should anonymize: Ushuaia', async () => {
      const input = 'Traveling through Ushuaia this winter.';
      const result = await service.anonymize(Compliance.GDPR, input);
      expect(result.anonymizedText).toMatch(
        /^Traveling through <[^>]+> this winter\.$/,
      );
    });

    it('should anonymize: Ilulissat', async () => {
      const input = 'Currently staying near Ilulissat.';
      const result = await service.anonymize(Compliance.GDPR, input);
      expect(result.anonymizedText).toMatch(
        /^Currently staying near <[^>]+>\.$/,
      );
    });

    it('should anonymize: Lhasa', async () => {
      const input = 'I once studied in Lhasa.';
      const result = await service.anonymize(Compliance.GDPR, input);
      expect(result.anonymizedText).toMatch(/^I once studied in <[^>]+>\.$/);
    });

    it('should anonymize: Nuuk', async () => {
      const input = 'My relatives live in Nuuk.';
      const result = await service.anonymize(Compliance.GDPR, input);
      expect(result.anonymizedText).toMatch(/^My relatives live in <[^>]+>\.$/);
    });

    it('should anonymize: Kamianets-Podilskyi', async () => {
      const input = 'We departed from Kamianets-Podilskyi yesterday.';
      const result = await service.anonymize(Compliance.GDPR, input);
      expect(result.anonymizedText).toMatch(
        /^We departed from <[^>]+> yesterday\.$/,
      );
    });

    it('should anonymize: Ulaanbaatar', async () => {
      const input = 'My office was relocated to Ulaanbaatar.';
      const result = await service.anonymize(Compliance.GDPR, input);
      expect(result.anonymizedText).toMatch(
        /^My office was relocated to <[^>]+>\.$/,
      );
    });

    it('should anonymize: Longyearbyen', async () => {
      const input = 'Research station located in Longyearbyen.';
      const result = await service.anonymize(Compliance.GDPR, input);
      expect(result.anonymizedText).toMatch(
        /^Research station located in <[^>]+>\.$/,
      );
    });

    it('should anonymize: Timbuktu', async () => {
      const input = 'He wrote postcards from Timbuktu.';
      const result = await service.anonymize(Compliance.GDPR, input);
      expect(result.anonymizedText).toMatch(
        /^He wrote postcards from <[^>]+>\.$/,
      );
    });

    it('should anonymize: Rotorua', async () => {
      const input = 'Vacationing around Rotorua this month.';
      const result = await service.anonymize(Compliance.GDPR, input);
      expect(result.anonymizedText).toMatch(
        /^Vacationing around <[^>]+> this month\.$/,
      );
    });

    it('should anonymize: Sighişoara', async () => {
      const input = 'I spent a summer in Sighişoara.';
      const result = await service.anonymize(Compliance.GDPR, input);
      expect(result.anonymizedText).toMatch(/^I spent a summer in <[^>]+>\.$/);
    });

    it('should anonymize: Rovaniemi', async () => {
      const input = 'Conference held in Rovaniemi.';
      const result = await service.anonymize(Compliance.GDPR, input);
      expect(result.anonymizedText).toMatch(/^Conference held in <[^>]+>\.$/);
    });

    it('should anonymize: Samarkand', async () => {
      const input = 'My grandparents came from Samarkand.';
      const result = await service.anonymize(Compliance.GDPR, input);
      expect(result.anonymizedText).toMatch(
        /^My grandparents came from <[^>]+>\.$/,
      );
    });

    it('should anonymize: Valparaíso', async () => {
      const input = 'Docked near Valparaíso last year.';
      const result = await service.anonymize(Compliance.GDPR, input);
      expect(result.anonymizedText).toMatch(
        /^Docked near <[^>]+> last year\.$/,
      );
    });

    it('should anonymize: Khiva', async () => {
      const input = 'Tour starts in Khiva tomorrow.';
      const result = await service.anonymize(Compliance.GDPR, input);
      expect(result.anonymizedText).toMatch(
        /^Tour starts in <[^>]+> tomorrow\.$/,
      );
    });

    it('should anonymize: Chişinău', async () => {
      const input = 'My package arrived in Chişinău.';
      const result = await service.anonymize(Compliance.GDPR, input);
      expect(result.anonymizedText).toMatch(
        /^My package arrived in <[^>]+>\.$/,
      );
    });

    it('should anonymize: Goreme', async () => {
      const input = 'We stayed near Goreme for a week.';
      const result = await service.anonymize(Compliance.GDPR, input);
      expect(result.anonymizedText).toMatch(
        /^We stayed near <[^>]+> for a week\.$/,
      );
    });

    it('should anonymize: Zanzibar', async () => {
      const input = 'Business trip to Zanzibar planned.';
      const result = await service.anonymize(Compliance.GDPR, input);
      expect(result.anonymizedText).toMatch(
        /^Business trip to <[^>]+> planned\.$/,
      );
    });

    it('should anonymize: Kolomyia', async () => {
      const input = 'Temperatures in Kolomyia are mild.';
      const result = await service.anonymize(Compliance.GDPR, input);
      expect(result.anonymizedText).toMatch(
        /^Temperatures in <[^>]+> are mild\.$/,
      );
    });

    it('should anonymize: Bled', async () => {
      const input = 'Currently relaxing in Bled.';
      const result = await service.anonymize(Compliance.GDPR, input);
      expect(result.anonymizedText).toMatch(
        /^Currently relaxing in <[^>]+>\.$/,
      );
    });

    it('should anonymize: Chefchaouen', async () => {
      const input = 'Photographs taken in Chefchaouen.';
      const result = await service.anonymize(Compliance.GDPR, input);
      expect(result.anonymizedText).toMatch(/^Photographs taken in <[^>]+>\.$/);
    });

    it('should anonymize: Qeqertarsuaq', async () => {
      const input = 'Researchers stayed in Qeqertarsuaq during the expedition.';
      const result = await service.anonymize(Compliance.GDPR, input);
      expect(result.anonymizedText).toMatch(
        /^Researchers stayed in <[^>]+> during the expedition\.$/,
      );
    });

    it('should anonymize: Ittoqqortoormiit', async () => {
      const input = 'A supply ship reached Ittoqqortoormiit last month.';
      const result = await service.anonymize(Compliance.GDPR, input);
      expect(result.anonymizedText).toMatch(
        /^A supply ship reached <[^>]+> last month\.$/,
      );
    });

    it('should anonymize: Llanfairpwllgwyngyll', async () => {
      const input =
        'I once passed through Llanfairpwllgwyngyll during a rail trip.';
      const result = await service.anonymize(Compliance.GDPR, input);
      expect(result.anonymizedText).toMatch(
        /^I once passed through <[^>]+> during a rail trip\.$/,
      );
    });

    it('should anonymize: Aït Benhaddou', async () => {
      const input = 'Scenes were filmed near Aït Benhaddou.';
      const result = await service.anonymize(Compliance.GDPR, input);
      expect(result.anonymizedText).toMatch(
        /^Scenes were filmed near <[^>]+>\.$/,
      );
    });

    it('should anonymize: Tórshavn', async () => {
      const input = 'Cargo arrived in Tórshavn overnight.';
      const result = await service.anonymize(Compliance.GDPR, input);
      expect(result.anonymizedText).toMatch(
        /^Cargo arrived in <[^>]+> overnight\.$/,
      );
    });

    it('should anonymize: Kangerlussuaq', async () => {
      const input = 'The aircraft refueled in Kangerlussuaq.';
      const result = await service.anonymize(Compliance.GDPR, input);
      expect(result.anonymizedText).toMatch(
        /^The aircraft refueled in <[^>]+>\.$/,
      );
    });

    it('should anonymize: Svalbardbyen', async () => {
      const input = 'An old mining camp existed near Svalbardbyen.';
      const result = await service.anonymize(Compliance.GDPR, input);
      expect(result.anonymizedText).toMatch(
        /^An old mining camp existed near <[^>]+>\.$/,
      );
    });

    it('should anonymize: Kizhinga', async () => {
      const input = 'My guide originally came from Kizhinga.';
      const result = await service.anonymize(Compliance.GDPR, input);
      expect(result.anonymizedText).toMatch(
        /^My guide originally came from <[^>]+>\.$/,
      );
    });

    it('should anonymize: Húsavík', async () => {
      const input = 'Whale watching tours depart from Húsavík.';
      const result = await service.anonymize(Compliance.GDPR, input);
      expect(result.anonymizedText).toMatch(
        /^Whale watching tours depart from <[^>]+>\.$/,
      );
    });

    it('should anonymize: Oymyakon', async () => {
      const input = 'Weather reports mentioned Oymyakon repeatedly.';
      const result = await service.anonymize(Compliance.GDPR, input);
      expect(result.anonymizedText).toMatch(
        /^Weather reports mentioned <[^>]+> repeatedly\.$/,
      );
    });

    it('should anonymize: Shakhrisabz', async () => {
      const input = 'The caravan stopped in Shakhrisabz.';
      const result = await service.anonymize(Compliance.GDPR, input);
      expect(result.anonymizedText).toMatch(
        /^The caravan stopped in <[^>]+>\.$/,
      );
    });

    it('should anonymize: Egilsstaðir', async () => {
      const input = 'My luggage was rerouted through Egilsstaðir.';
      const result = await service.anonymize(Compliance.GDPR, input);
      expect(result.anonymizedText).toMatch(
        /^My luggage was rerouted through <[^>]+>\.$/,
      );
    });

    it('should anonymize: Sighiștel', async () => {
      const input = 'A remote cave lies near Sighiștel.';
      const result = await service.anonymize(Compliance.GDPR, input);
      expect(result.anonymizedText).toMatch(
        /^A remote cave lies near <[^>]+>\.$/,
      );
    });

    it('should anonymize: Bakhmach', async () => {
      const input = 'Train connections through Bakhmach were delayed.';
      const result = await service.anonymize(Compliance.GDPR, input);
      expect(result.anonymizedText).toMatch(
        /^Train connections through <[^>]+> were delayed\.$/,
      );
    });

    it('should anonymize: Røros', async () => {
      const input = 'The documentary was shot in Røros.';
      const result = await service.anonymize(Compliance.GDPR, input);
      expect(result.anonymizedText).toMatch(
        /^The documentary was shot in <[^>]+>\.$/,
      );
    });

    it('should anonymize: Chornobyl', async () => {
      const input = 'The tour group visited Chornobyl briefly.';
      const result = await service.anonymize(Compliance.GDPR, input);
      expect(result.anonymizedText).toMatch(
        /^The tour group visited <[^>]+> briefly\.$/,
      );
    });

    it('should anonymize: Tskaltubo', async () => {
      const input = 'Old sanatoriums still stand in Tskaltubo.';
      const result = await service.anonymize(Compliance.GDPR, input);
      expect(result.anonymizedText).toMatch(
        /^Old sanatoriums still stand in <[^>]+>\.$/,
      );
    });

    it('should anonymize: Grytviken', async () => {
      const input = 'Scientists maintained a station at Grytviken.';
      const result = await service.anonymize(Compliance.GDPR, input);
      expect(result.anonymizedText).toMatch(
        /^Scientists maintained a station at <[^>]+>\.$/,
      );
    });

    it('should anonymize: Zhdeniievo', async () => {
      const input = 'A mountain trail begins near Zhdeniievo.';
      const result = await service.anonymize(Compliance.GDPR, input);
      expect(result.anonymizedText).toMatch(
        /^A mountain trail begins near <[^>]+>\.$/,
      );
    });

    it('should anonymize: Upernavik', async () => {
      const input = 'Medical supplies were flown into Upernavik.';
      const result = await service.anonymize(Compliance.GDPR, input);
      expect(result.anonymizedText).toMatch(
        /^Medical supplies were flown into <[^>]+>\.$/,
      );
    });
  });
};

export default runLocationTestsGDPR;
