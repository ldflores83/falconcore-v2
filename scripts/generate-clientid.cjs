// Script to generate clientId for debugging
const crypto = require('crypto');

const generateClientId = (email, projectId) => {
  const salt = process.env.SYSTEM_SALT || "falconcore_default_salt";
  const combined = `${email}_${projectId}`;
  return crypto.createHmac("sha256", salt).update(combined).digest("hex");
};

const email = 'luisdaniel883@gmail.com';
const projectId = 'onboardingaudit';

const clientId = generateClientId(email, projectId);

console.log('🔧 Generated ClientId:');
console.log('Email:', email);
console.log('ProjectId:', projectId);
console.log('ClientId:', clientId);
console.log('Length:', clientId.length);
