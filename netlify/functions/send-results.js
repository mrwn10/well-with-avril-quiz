const { Resend } = require('resend');

// Initialize Resend with API key from environment variables
const resend = new Resend(process.env.RESEND_API_KEY);

exports.handler = async (event) => {
  // Only allow POST requests
  if (event.httpMethod !== 'POST') {
    return {
      statusCode: 405,
      body: JSON.stringify({ error: 'Method not allowed' })
    };
  }

  try {
    // Parse the request body
    const data = JSON.parse(event.body);
    const { userEmail, results, userName } = data;

    // Validate required fields
    if (!userEmail || !results) {
      return {
        statusCode: 400,
        body: JSON.stringify({ error: 'Missing required fields' })
      };
    }

    const name = userName || userEmail.split('@')[0];

    // Email to user
    const userEmailResult = await resend.emails.send({
      from: 'Well with Avril <onboarding@resend.dev>', // Use this for testing
      // Once you have custom domain: from: 'Well with Avril <quizzes@wellwithavril.com>',
      to: [userEmail],
      subject: 'Your Dosha Quiz Results from Well with Avril',
      html: generateUserEmailHTML(results, name)
    });

    console.log('User email sent:', userEmailResult);

    // Email to admin (you)
    const adminEmailResult = await resend.emails.send({
      from: 'Well with Avril <onboarding@resend.dev>',
      to: ['wellwithavril02@gmail.com'], // REPLACE WITH YOUR EMAIL
      subject: `New Quiz Results: ${results.primaryDosha} - ${userEmail}`,
      html: generateAdminEmailHTML(results, userEmail, name)
    });

    console.log('Admin email sent:', adminEmailResult);

    return {
      statusCode: 200,
      body: JSON.stringify({ 
        message: 'Results sent successfully',
        sentTo: userEmail
      })
    };

  } catch (error) {
    console.error('Resend error:', error);
    
    return {
      statusCode: 500,
      body: JSON.stringify({ 
        error: 'Failed to send email',
        details: error.message 
      })
    };
  }
};

// Generate HTML for user email
function generateUserEmailHTML(results, userName) {
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
          padding: 10px 20px; 
          border-radius: 50px; 
          display: inline-block;
          font-family: 'Poppins', sans-serif;
          font-weight: 500;
          letter-spacing: 0.5px;
        }
        .score-bar-container { 
          background: #e9ecef; 
          height: 30px; 
          border-radius: 15px; 
          margin: 10px 0;
          overflow: hidden;
          position: relative;
        }
        .score-fill { 
          height: 100%; 
          background: linear-gradient(90deg, #6C9571, #8ab88f);
          color: white;
          line-height: 30px;
          padding-left: 15px;
          white-space: nowrap;
          font-weight: 500;
        }
        .interpretation-box {
          background: white; 
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
        .score-label {
          font-weight: 600;
          color: #2c3e50;
          margin-top: 15px;
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
          <div style="text-align: center; margin-bottom: 25px;">
            <span class="dosha-badge">Primary Dosha: ${results.primaryDosha}</span>
          </div>
          
          <h3 style="color: #6C9571; margin-bottom: 20px;">Your Dosha Breakdown</h3>
          
          <div style="margin: 20px 0;">
            <div class="score-label">Vata (A) - ${results.counts.A} points</div>
            <div class="score-bar-container">
              <div class="score-fill" style="width: ${results.bars[0].percentage}%;">
                ${results.bars[0].percentage}%
              </div>
            </div>
            
            <div class="score-label">Pitta (B) - ${results.counts.B} points</div>
            <div class="score-bar-container">
              <div class="score-fill" style="width: ${results.bars[1].percentage}%;">
                ${results.bars[1].percentage}%
              </div>
            </div>
            
            <div class="score-label">Kapha (C) - ${results.counts.C} points</div>
            <div class="score-bar-container">
              <div class="score-fill" style="width: ${results.bars[2].percentage}%;">
                ${results.bars[2].percentage}%
              </div>
            </div>
          </div>
          
          <div class="interpretation-box">
            <h4 style="margin-top: 0; color: #6C9571;">What This Means:</h4>
            <p>${results.interpretation.replace(/<strong>|<\/strong>/g, '')}</p>
          </div>
        </div>
        
        <div class="footer">
          <p style="margin-bottom: 10px;">✨ Understanding your Dosha helps you make lifestyle choices that support your natural mind-body rhythm.</p>
          <p style="font-size: 0.9rem; opacity: 0.8;">Visit us again at <a href="https://brilliant-pastelito-6888d3.netlify.app" style="color: #6C9571; text-decoration: none;">Well with Avril</a> for more quizzes and insights.</p>
        </div>
      </div>
    </body>
    </html>
  `;
}

// Generate HTML for admin email
function generateAdminEmailHTML(results, userEmail, userName) {
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
        .detail { 
          margin: 15px 0; 
          padding: 10px;
          background: #f8f9fa;
          border-radius: 10px;
        }
        .label { 
          font-weight: 600; 
          color: #6C9571;
          display: inline-block;
          width: 100px;
        }
        hr {
          border: none;
          border-top: 2px solid #e9ecef;
          margin: 20px 0;
        }
        .timestamp {
          color: #666;
          font-size: 0.9rem;
          text-align: right;
        }
      </style>
      <link href="https://fonts.googleapis.com/css2?family=Over+the+Rainbow&family=Ubuntu:wght@300;400;500;700&display=swap" rel="stylesheet">
    </head>
    <body>
      <div class="container">
        <h2>✨ New Quiz Submission</h2>
        
        <div class="timestamp">${new Date().toLocaleString()}</div>
        
        <div class="detail">
          <span class="label">User:</span> ${name}<br>
          <span class="label">Email:</span> ${userEmail}<br>
          <span class="label">Primary:</span> ${results.primaryDosha}
        </div>
        
        <h3 style="color: #6C9571;">Detailed Scores:</h3>
        
        <div class="detail">
          <div><span class="label">Vata (A):</span> ${results.counts.A} points (${results.bars[0].percentage}%)</div>
          <div><span class="label">Pitta (B):</span> ${results.counts.B} points (${results.bars[1].percentage}%)</div>
          <div><span class="label">Kapha (C):</span> ${results.counts.C} points (${results.bars[2].percentage}%)</div>
        </div>
        
        <div class="detail">
          <span class="label">Interpretation:</span><br>
          <p style="margin: 10px 0 0 0; padding-left: 15px;">${results.interpretation.replace(/<[^>]*>/g, '')}</p>
        </div>
        
        <hr>
        <p style="color: #666; font-size: 0.85rem; text-align: center;">This email was sent from your Well with Avril quiz application.</p>
      </div>
    </body>
    </html>
  `;
}