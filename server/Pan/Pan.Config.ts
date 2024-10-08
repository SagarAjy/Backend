const { PAN_VERIFICATION_API_ENDPOINT = '', PAN_VERIFICATION_API_KEY = '' } =
  process.env;

const REQUIRED_CONFIG = [
  'PAN_VERIFICATION_API_ENDPOINT',
  'PAN_VERIFICATION_API_KEY',
];

REQUIRED_CONFIG.forEach(key => {
  if (!process.env[key]) {
    console.error('[Error] Missing PAN Verfication Config:', key);
    return process.exit(1);
  }
});

const PAN_CONFIG = {
  PAN_VERIFICATION_API_ENDPOINT,
  PAN_VERIFICATION_API_KEY,
};

export default PAN_CONFIG;
