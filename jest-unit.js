module.exports = {
  preset: 'ts-jest',
  testEnvironment: 'node',
  rootDir: 'src',
  moduleFileExtensions: ['js', 'json', 'ts'],
  testRegex: '.*\\.spec\\.ts$',
  transform: { '^.+\\.(t|j)s$': 'ts-jest' },
  moduleNameMapper: {
    '^@/(.*)$': '<rootDir>/$1',
    '^@common/(.*)$': '<rootDir>/common/$1',
    '^@entities/(.*)$': '<rootDir>/common/db/entities/$1',
    '^@modules/(.*)$': '<rootDir>/modules/$1',
  },
  moduleDirectories: ['node_modules', '<rootDir>'],
};
