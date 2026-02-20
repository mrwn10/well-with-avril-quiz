const { Resend } = require('resend');

// Initialize Resend with API key from environment variables
const resend = new Resend(process.env.RESEND_API_KEY);

exports.handler = async (event) => {
  console.log('Send dosha results function triggered');
  console.log('RESEND_API_KEY exists:', !!process.env.RESEND_API_KEY);
  
  // Enable CORS
  const headers = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'Content-Type',
    'Access-Control-Allow-Methods': 'POST, OPTIONS'
  };
  
  // Handle preflight OPTIONS request
  if (event.httpMethod === 'OPTIONS') {
    return {
      statusCode: 200,
      headers,
      body: ''
    };
  }
  
  // Only allow POST requests
  if (event.httpMethod !== 'POST') {
    return {
      statusCode: 405,
      headers,
      body: JSON.stringify({ error: 'Method not allowed' })
    };
  }

  try {
    // Check if API key is configured
    if (!process.env.RESEND_API_KEY) {
      console.error('RESEND_API_KEY is not set');
      return {
        statusCode: 500,
        headers,
        body: JSON.stringify({ 
          error: 'Email service not configured',
          details: 'RESEND_API_KEY is missing'
        })
      };
    }

    // Parse the request body
    const data = JSON.parse(event.body);
    const { userEmail, results, userName } = data;

    console.log('Sending dosha results email to USER:', userEmail);
    console.log('Results data:', results);

    // Validate required fields
    if (!userEmail || !results) {
      return {
        statusCode: 400,
        headers,
        body: JSON.stringify({ error: 'Missing required fields' })
      };
    }

    const name = userName || userEmail.split('@')[0];

    // Email to user (THE PERSON WHO TOOK THE QUIZ)
    const userEmailResult = await resend.emails.send({
      from: 'Well with Avril <onboarding@resend.dev>',
      to: [userEmail],
      subject: 'Your Dosha Quiz Results from Well with Avril',
      html: generateDoshaUserEmailHTML(results, name)
    });

    console.log('Email sent to user:', userEmailResult);

    // Also send a copy to yourself (admin)
    const adminEmailResult = await resend.emails.send({
      from: 'Well with Avril <onboarding@resend.dev>',
      to: ['wellwithavril02@gmail.com'],
      subject: `[ADMIN] New Dosha Quiz Results: ${results.primaryDosha} - ${userEmail}`,
      html: generateDoshaAdminEmailHTML(results, userEmail, name)
    });

    console.log('Admin copy email sent:', adminEmailResult);

    return {
      statusCode: 200,
      headers,
      body: JSON.stringify({ 
        message: 'Dosha results sent successfully',
        sentTo: userEmail,
        adminNotified: true
      })
    };

  } catch (error) {
    console.error('Resend error:', error);
    console.error('Error details:', {
      message: error.message,
      name: error.name,
      stack: error.stack
    });
    
    return {
      statusCode: 500,
      headers,
      body: JSON.stringify({ 
        error: 'Failed to send email',
        details: error.message
      })
    };
  }
};

function generateDoshaUserEmailHTML(results, userName) {
  const name = userName || 'there';
  
  return `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="UTF-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <style>
        body { 
          font-family: 'Ubuntu', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif; 
          line-height: 1.6; 
          color: #2c3e50; 
          margin: 0;
          padding: 0;
          background-color: #f8f9fa;
        }
        .container { 
          max-width: 600px; 
          margin: 0 auto; 
          padding: 20px; 
          background-color: #ffffff;
          border-radius: 30px;
          box-shadow: 0 20px 40px rgba(108, 149, 113, 0.1);
        }
        .header { 
          text-align: center; 
          margin-bottom: 30px; 
          padding: 20px 20px 0;
        }
        .logo { 
          width: 80px; 
          height: 80px; 
          border-radius: 50%; 
          box-shadow: 0 5px 15px rgba(108, 149, 113, 0.2);
        }
        h1 { 
          font-family: 'Over the Rainbow', cursive; 
          color: #6C9571; 
          font-size: 2rem;
          margin-top: 10px;
          text-transform: lowercase;
        }
        h2 {
          font-family: 'Over the Rainbow', cursive;
          color: #6C9571;
        }
        .results-card { 
          background: #f8f9fa; 
          border-radius: 25px; 
          padding: 25px; 
          margin: 20px 0; 
        }
        .dosha-badge { 
          background: #6C9571; 
          color: white; 
          padding: 15px 25px; 
          border-radius: 50px; 
          display: inline-block;
          font-family: 'Poppins', sans-serif;
          font-weight: 500;
          font-size: 1.2rem;
          letter-spacing: 1px;
        }
        .score-item {
          margin: 20px 0;
          padding: 15px;
          background: white;
          border-radius: 15px;
          box-shadow: 0 2px 10px rgba(0,0,0,0.05);
        }
        .score-header {
          display: flex;
          justify-content: space-between;
          margin-bottom: 10px;
        }
        .dosha-name {
          font-size: 1.1rem;
          font-weight: 600;
          color: #2c3e50;
        }
        .dosha-score {
          color: #6C9571;
          font-weight: 500;
        }
        .progress-bar-container { 
          background: #e9ecef; 
          height: 12px; 
          border-radius: 6px; 
          margin: 10px 0;
          overflow: hidden;
        }
        .progress-fill { 
          height: 100%; 
          background: linear-gradient(90deg, #6C9571, #8ab88f);
          border-radius: 6px;
          transition: width 0.3s ease;
        }
        .interpretation-box {
          background: rgba(108, 149, 113, 0.1);
          border-radius: 15px; 
          padding: 20px; 
          border-left: 4px solid #6C9571;
          margin: 20px 0;
        }
        .footer { 
          text-align: center; 
          margin-top: 30px; 
          padding: 20px;
          color: #6C9571;
          border-top: 2px solid #e9ecef;
        }
        .footer a {
          color: #6C9571;
          text-decoration: none;
          font-weight: 500;
        }
        .footer a:hover {
          text-decoration: underline;
        }
        .percentage {
          font-size: 0.9rem;
          color: #6C9571;
        }
        @media only screen and (max-width: 600px) {
          .container { padding: 15px; }
          h1 { font-size: 1.8rem; }
        }
      </style>
      <link href="https://fonts.googleapis.com/css2?family=Over+the+Rainbow&family=Poppins:wght@400;500;600&family=Ubuntu:wght@300;400;500;700&display=swap" rel="stylesheet">
    </head>
    <body>
      <div class="container">
        <div class="header">
          <img src="https://brilliant-pastelito-6888d3.netlify.app/img/logo.webp" alt="Well with Avril" class="logo">
          <h1>well with avril</h1>
        </div>
        
        <h2>Hello ${name}!</h2>
        <p>Thank you for completing the Dosha Check. Here are your personalized results:</p>
        
        <div class="results-card">
          <div style="text-align: center; margin-bottom: 30px;">
            <span class="dosha-badge">✨ ${results.primaryDosha}</span>
            <p style="margin-top: 10px; color: #666;">Your Primary Dosha</p>
          </div>
          
          <h3 style="color: #6C9571; margin-bottom: 20px;">Your Dosha Breakdown</h3>
          
          ${results.bars.map(bar => `
            <div class="score-item">
              <div class="score-header">
                <span class="dosha-name">${bar.label}</span>
                <span class="dosha-score">${bar.count} points <span class="percentage">(${bar.percentage}%)</span></span>
              </div>
              <div class="progress-bar-container">
                <div class="progress-fill" style="width: ${bar.percentage}%;"></div>
              </div>
            </div>
          `).join('')}
          
          <div class="interpretation-box">
            <h4 style="margin-top: 0; color: #6C9571; margin-bottom: 10px;">🧘 What This Means</h4>
            <p style="margin: 0; line-height: 1.6;">${results.interpretation}</p>
          </div>
        </div>
        
        <div class="results-card" style="margin-top: 20px; background: white;">
          <h4 style="color: #6C9571; margin-top: 0;">🌿 Understanding Your Dosha</h4>
          <p style="margin-bottom: 10px;">Your dosha is your natural mind-body rhythm. When in balance, you feel energized and clear. When out of balance, you may notice specific patterns:</p>
          <ul style="color: #4a5568;">
            ${results.primaryDosha.includes('Vata') ? '<li>⚡ Vata: Anxiety, irregularity, feeling ungrounded</li>' : ''}
            ${results.primaryDosha.includes('Pitta') ? '<li>🔥 Pitta: Irritability, intensity, perfectionism</li>' : ''}
            ${results.primaryDosha.includes('Kapha') ? '<li>🌱 Kapha: Lethargy, attachment, resistance to change</li>' : ''}
          </ul>
        </div>
        
        <div class="footer">
          <p style="margin-bottom: 10px;">✨ Understanding your Dosha helps you make lifestyle choices that support your natural rhythm.</p>
          <p style="font-size: 0.9rem; opacity: 0.8;">
            Visit us again at <a href="https://brilliant-pastelito-6888d3.netlify.app">Well with Avril</a> for more quizzes and insights.
          </p>
          <p style="font-size: 0.8rem; color: #999; margin-top: 15px;">
            Completed: ${new Date().toLocaleString()}
          </p>
        </div>
      </div>
    </body>
    </html>
  `;
}

function generateDoshaAdminEmailHTML(results, userEmail, userName) {
  const name = userName || 'Not provided';
  
  return `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="UTF-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <style>
        body { 
          font-family: 'Ubuntu', -apple-system, BlinkMacSystemFont, sans-serif; 
          line-height: 1.6; 
          color: #2c3e50;
          background-color: #f8f9fa;
          padding: 20px;
        }
        .container { 
          max-width: 600px; 
          margin: 0 auto; 
          background: white;
          border-radius: 20px;
          padding: 25px;
          box-shadow: 0 10px 30px rgba(0,0,0,0.1);
        }
        h2 { 
          color: #6C9571; 
          font-family: 'Over the Rainbow', cursive;
          margin-top: 0;
        }
        .user-info {
          background: #f0f7f1;
          border-radius: 10px;
          padding: 15px;
          margin: 20px 0;
        }
        .info-row {
          display: flex;
          margin-bottom: 8px;
        }
        .info-label {
          font-weight: 600;
          width: 100px;
          color: #6C9571;
        }
        .info-value {
          flex: 1;
        }
        .score-summary {
          background: #f8f9fa;
          border-radius: 10px;
          padding: 15px;
          margin: 15px 0;
        }
        .score-row {
          display: flex;
          justify-content: space-between;
          margin-bottom: 8px;
          padding-bottom: 8px;
          border-bottom: 1px solid #e9ecef;
        }
        .score-row:last-child {
          border-bottom: none;
          margin-bottom: 0;
          padding-bottom: 0;
        }
        hr {
          border: none;
          border-top: 2px solid #e9ecef;
          margin: 20px 0;
        }
        .timestamp {
          color: #666;
          font-size: 0.85rem;
          text-align: right;
          margin-top: 20px;
        }
      </style>
      <link href="https://fonts.googleapis.com/css2?family=Over+the+Rainbow&family=Ubuntu:wght@300;400;500;700&display=swap" rel="stylesheet">
    </head>
    <body>
      <div class="container">
        <h2>🌿 New Dosha Quiz Results</h2>
        
        <div class="timestamp">${new Date().toLocaleString()}</div>
        
        <div class="user-info">
          <div class="info-row">
            <span class="info-label">User:</span>
            <span class="info-value">${name}</span>
          </div>
          <div class="info-row">
            <span class="info-label">Email:</span>
            <span class="info-value">${userEmail}</span>
          </div>
          <div class="info-row">
            <span class="info-label">Primary:</span>
            <span class="info-value"><strong>${results.primaryDosha}</strong></span>
          </div>
        </div>
        
        <h3 style="color: #6C9571;">Score Breakdown:</h3>
        
        <div class="score-summary">
          ${results.bars.map(bar => `
            <div class="score-row">
              <span><strong>${bar.label}:</strong></span>
              <span>${bar.count} points (${bar.percentage}%)</span>
            </div>
          `).join('')}
        </div>
        
        <div style="background: #f8f9fa; border-radius: 10px; padding: 15px;">
          <strong style="color: #6C9571;">Interpretation:</strong>
          <p style="margin: 10px 0 0 0; color: #4a5568;">${results.interpretation.replace(/<[^>]*>/g, '')}</p>
        </div>
        
        <hr>
        <p style="color: #666; font-size: 0.85rem; text-align: center;">
          This is an admin notification for a completed dosha quiz.
        </p>
      </div>
    </body>
    </html>
  `;
}