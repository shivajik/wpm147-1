import { SeoAnalyzer } from './server/seo-analyzer.js';

const analyzer = new SeoAnalyzer();

console.log('🔍 Testing Enhanced SEO Analysis for ascollegechincholi.com...');

analyzer.analyzeWebsite('https://ascollegechincholi.com')
  .then(result => {
    console.log('\n=== JAVASCRIPT ANALYSIS ===');
    if (result.javascriptAnalysis) {
      console.log(`✅ Total Scripts: ${result.javascriptAnalysis.totalScripts}`);
      console.log(`✅ External Scripts: ${result.javascriptAnalysis.externalScripts}`);
      console.log(`✅ Inline Scripts: ${result.javascriptAnalysis.inlineScripts}`);
      console.log(`✅ Async Scripts: ${result.javascriptAnalysis.asyncScripts}`);
      console.log(`✅ Defer Scripts: ${result.javascriptAnalysis.deferScripts}`);
      console.log(`✅ HTML Script Tags: ${result.javascriptAnalysis.htmlScriptTags || 0}`);
    } else {
      console.log('❌ No JavaScript analysis data');
    }

    console.log('\n=== CSS ANALYSIS ===');
    if (result.cssAnalysis) {
      console.log(`✅ Total Stylesheets: ${result.cssAnalysis.totalStylesheets}`);
      console.log(`✅ External Stylesheets: ${result.cssAnalysis.externalStylesheets}`);
      console.log(`✅ Inline Styles: ${result.cssAnalysis.inlineStyles}`);
      console.log(`✅ Minified Stylesheets: ${result.cssAnalysis.minifiedStylesheets}`);
    } else {
      console.log('❌ No CSS analysis data');
    }

    console.log('\n=== PERFORMANCE ANALYSIS ===');
    console.log(`✅ Load Time: ${result.performance.loadTime}ms`);
    console.log(`✅ Page Size: ${result.performance.pageSize}KB`);
    console.log(`✅ Total Requests: ${result.performance.requests}`);
    
    if (result.performance.resourceBreakdown) {
      console.log(`✅ Scripts: ${result.performance.resourceBreakdown.scripts}`);
      console.log(`✅ Stylesheets: ${result.performance.resourceBreakdown.stylesheets}`);
      console.log(`✅ Images: ${result.performance.resourceBreakdown.images}`);
      console.log(`✅ Performance Score: ${result.performance.performanceScore || 'N/A'}`);
    }

    console.log('\n=== COMPARISON WITH EXTERNAL TOOL ===');
    console.log('External Tool: JavaScript=12, CSS=10, Images=4');
    console.log(`Our System: JavaScript=${result.javascriptAnalysis?.totalScripts || 0}, CSS=${result.cssAnalysis?.totalStylesheets || 0}, Images=${result.images?.total || 0}`);
    
    if (result.javascriptAnalysis?.totalScripts > 0 && result.cssAnalysis?.totalStylesheets > 0) {
      console.log('🎉 SUCCESS: Enhanced SEO analysis is generating real data!');
    } else {
      console.log('⚠️  WARNING: Still seeing zero values in some sections');
    }
  })
  .catch(err => {
    console.error('❌ Analysis failed:', err.message);
  });