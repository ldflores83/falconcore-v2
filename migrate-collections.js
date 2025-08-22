// Script de migración para mover datos a las nuevas colecciones específicas por proyecto
const API_BASE = 'https://api-fu54nvsqfa-uc.a.run.app';

// Mapeo de colecciones antiguas a nuevas
const COLLECTION_MAPPING = {
  // Waitlist collections
  'waitlist_onboarding_audit': 'onboardingaudit_waitlist',
  'waitlist_jobpulse': 'jobpulse_waitlist',
  'waitlist_pulziohq': 'pulziohq_waitlist',
  'waitlist_ignium': 'ignium_waitlist',
  'waitlist_ahau': 'ahau_waitlist',
  
  // Analytics collections (global to project-specific)
  'analytics_visits': {
    'onboardingaudit': 'onboardingaudit_analytics_visits',
    'jobpulse': 'jobpulse_analytics_visits',
    'pulziohq': 'pulziohq_analytics_visits',
    'ignium': 'ignium_analytics_visits',
    'ahau': 'ahau_analytics_visits',
    'uaylabs': 'uaylabs_analytics_visits'
  },
  'analytics_stats': {
    'onboardingaudit': 'onboardingaudit_analytics_stats',
    'jobpulse': 'jobpulse_analytics_stats',
    'pulziohq': 'pulziohq_analytics_stats',
    'ignium': 'ignium_analytics_stats',
    'ahau': 'ahau_analytics_stats',
    'uaylabs': 'uaylabs_analytics_stats'
  }
};

async function migrateData() {
  console.log('🚀 Starting data migration...\n');
  
  // Migrar waitlist collections
  console.log('📋 Migrating waitlist collections...');
  for (const [oldCollection, newCollection] of Object.entries(COLLECTION_MAPPING)) {
    if (typeof newCollection === 'string') {
      console.log(`  ${oldCollection} -> ${newCollection}`);
      // Aquí iría la lógica de migración real
    }
  }
  
  // Migrar analytics collections
  console.log('\n📊 Migrating analytics collections...');
  for (const [oldCollection, projectMapping] of Object.entries(COLLECTION_MAPPING)) {
    if (typeof projectMapping === 'object') {
      console.log(`  ${oldCollection}:`);
      for (const [projectId, newCollection] of Object.entries(projectMapping)) {
        console.log(`    ${projectId} -> ${newCollection}`);
      }
    }
  }
  
  console.log('\n✅ Migration plan generated!');
  console.log('\n⚠️  Note: This is a dry run. To actually migrate data, you would need to:');
  console.log('   1. Use Firebase Admin SDK to read from old collections');
  console.log('   2. Write to new collections with projectId filtering');
  console.log('   3. Update any references to use new collection names');
}

// Función para verificar qué datos existen actualmente
async function checkExistingData() {
  console.log('🔍 Checking existing data...\n');
  
  const products = ['uaylabs', 'ahau', 'onboardingaudit', 'ignium', 'jobpulse', 'pulziohq'];
  
  for (const productId of products) {
    console.log(`\n📊 ${productId}:`);
    
    // Check analytics
    try {
      const analyticsResponse = await fetch(`${API_BASE}/api/admin/analytics`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ projectId })
      });
      const analyticsData = await analyticsResponse.json();
      console.log(`  Analytics: ${analyticsData.totalVisits} visits, ${analyticsData.totalSubmissions} submissions, ${analyticsData.totalWaitlist} waitlist`);
    } catch (error) {
      console.log(`  Analytics: Error - ${error.message}`);
    }
    
    // Check waitlist
    try {
      const waitlistResponse = await fetch(`${API_BASE}/api/admin/waitlist`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ projectId })
      });
      const waitlistData = await waitlistResponse.json();
      console.log(`  Waitlist: ${waitlistData.waitlist?.length || 0} entries`);
    } catch (error) {
      console.log(`  Waitlist: Error - ${error.message}`);
    }
  }
}

// Ejecutar verificación
checkExistingData().then(() => {
  console.log('\n' + '='.repeat(50));
  migrateData();
}).catch(error => {
  console.error('\n❌ Error checking data:', error);
});
