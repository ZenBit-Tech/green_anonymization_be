import { Compliance } from '@common/constants';

const mapFramework = (code: string): Compliance => {
  switch (code) {
    case 'HIPAA_US':
      return Compliance.HIPAA;

    case 'GDPR_EU':
    case 'GDPR_UK':
      return Compliance.GDPR;

    case 'FADP_CH':
      return Compliance.GDPR;

    default:
      throw new Error(`Unsupported compliance framework: ${code}`);
  }
};

export default mapFramework;
