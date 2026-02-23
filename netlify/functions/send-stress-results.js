const { Resend } = require('resend');

const resend = new Resend(process.env.RESEND_API_KEY);

exports.handler = async (event) => {
  console.log('Send stress results function triggered');
  
  const headers = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'Content-Type',
    'Access-Control-Allow-Methods': 'POST, OPTIONS'
  };
  
  if (event.httpMethod === 'OPTIONS') {
    return { statusCode: 200, headers, body: '' };
  }
  
  if (event.httpMethod !== 'POST') {
    return {
      statusCode: 405,
      headers,
      body: JSON.stringify({ error: 'Method not allowed' })
    };
  }

  try {
    if (!process.env.RESEND_API_KEY) {
      throw new Error('RESEND_API_KEY not configured');
    }

    const data = JSON.parse(event.body);
    const { userEmail, results, userName } = data;

    if (!userEmail || !results) {
      return {
        statusCode: 400,
        headers,
        body: JSON.stringify({ error: 'Missing required fields' })
      };
    }

    const name = userName || userEmail.split('@')[0];
    
    // ✅ USING YOUR VERIFIED DOMAIN
    const fromEmail = 'Well with Avril <noreply@lseftesda.online>';

    // Send to user
    const userEmailResult = await resend.emails.send({
      from: fromEmail,
      to: [userEmail], // ✅ Now works with ANY email!
      subject: 'Your Stress Pattern Results from Well with Avril',
      html: generateStressUserEmailHTML(results, name)
    });

    console.log('Email sent to user:', userEmailResult);

    // Send admin copy to yourself
    const adminEmailResult = await resend.emails.send({
      from: fromEmail,
      to: ['wellwithavril02@gmail.com'],
      subject: `[ADMIN] New Stress Pattern Results: ${results.totalChecked} patterns - ${userEmail}`,
      html: generateStressAdminEmailHTML(results, userEmail, name)
    });

    return {
      statusCode: 200,
      headers,
      body: JSON.stringify({ 
        message: 'Results sent successfully',
        sentTo: userEmail,
        id: userEmailResult.id
      })
    };

  } catch (error) {
    console.error('Resend error:', error);
    
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

function generateStressUserEmailHTML(results, userName) {
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
        .total-badge { 
          background: #6C9571; 
          color: white; 
          padding: 15px 25px; 
          border-radius: 50px; 
          display: inline-block;
          font-family: 'Poppins', sans-serif;
          font-weight: 500;
          font-size: 1.2rem;
          letter-spacing: 0.5px;
        }
        .category-item {
          margin: 20px 0;
          padding: 15px;
          background: white;
          border-radius: 15px;
          box-shadow: 0 2px 10px rgba(0,0,0,0.05);
        }
        .category-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 10px;
        }
        .category-name {
          font-size: 1.1rem;
          font-weight: 600;
          color: #2c3e50;
        }
        .category-count {
          color: #6C9571;
          font-weight: 500;
        }
        .progress-bar-container { 
          background: #e9ecef; 
          height: 8px; 
          border-radius: 4px; 
          margin: 10px 0;
          overflow: hidden;
        }
        .progress-fill { 
          height: 100%; 
          background: linear-gradient(90deg, #6C9571, #8ab88f);
          border-radius: 4px;
          transition: width 0.3s ease;
        }
        .patterns-list {
          margin-top: 15px;
          border-top: 1px solid #e9ecef;
          padding-top: 15px;
        }
        .pattern-item {
          display: flex;
          align-items: start;
          gap: 10px;
          padding: 8px 0;
          border-bottom: 1px solid #f0f0f0;
          font-size: 0.95rem;
        }
        .pattern-item:last-child {
          border-bottom: none;
        }
        .pattern-check {
          color: #6C9571;
          font-weight: bold;
        }
        .reflection-box {
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
        <p>Thank you for completing the Stress Pattern Self-Check. Here are your personalized results:</p>
        
        <div class="results-card">
          <div style="text-align: center; margin-bottom: 30px;">
            <span class="total-badge">✨ ${results.totalChecked} Stress Patterns Identified</span>
          </div>
          
          <h3 style="color: #6C9571; margin-bottom: 20px;">Your Pattern Breakdown</h3>
          
          ${results.categoryCounts.map(cat => `
            <div class="category-item">
              <div class="category-header">
                <span class="category-name">${cat.emoji} ${cat.name}</span>
                <span class="category-count">${cat.count}/${cat.total}</span>
              </div>
              <div class="progress-bar-container">
                <div class="progress-fill" style="width: ${(cat.count/cat.total)*100}%;"></div>
              </div>
              
              ${cat.count > 0 ? `
                <div class="patterns-list">
                  <div style="font-weight: 500; color: #6C9571; margin-bottom: 10px; font-size: 0.9rem;">
                    Patterns you checked:
                  </div>
                  ${cat.patterns.map(p => `
                    <div class="pattern-item">
                      <span class="pattern-check">✓</span>
                      <span>${p}</span>
                    </div>
                  `).join('')}
                </div>
              ` : `
                <div style="color: #999; font-style: italic; margin-top: 10px; font-size: 0.9rem;">
                  No patterns checked in this category
                </div>
              `}
            </div>
          `).join('')}
          
          ${results.reflection && (results.reflection.otherPatterns || results.reflection.topThree.filter(t => t).length > 0 || results.reflection.showUpOften) ? `
            <div class="reflection-box">
              <h4 style="margin-top: 0; color: #6C9571; margin-bottom: 15px;">💭 Your Reflection</h4>
              
              ${results.reflection.otherPatterns ? `
                <div style="margin-bottom: 15px;">
                  <strong>Other patterns you noticed:</strong>
                  <p style="margin: 5px 0 0 0; color: #4a5568;">${results.reflection.otherPatterns}</p>
                </div>
              ` : ''}
              
              ${results.reflection.topThree.filter(t => t).length > 0 ? `
                <div style="margin-bottom: 15px;">
                  <strong>Your most draining patterns:</strong>
                  <ol style="margin: 5px 0 0 0; padding-left: 20px;">
                    ${results.reflection.topThree.filter(t => t).map(p => `<li style="color: #4a5568;">${p}</li>`).join('')}
                  </ol>
                </div>
              ` : ''}
              
              ${results.reflection.showUpOften ? `
                <div>
                  <strong>Do these show up often?</strong>
                  <p style="margin: 5px 0 0 0; color: #4a5568; text-transform: capitalize;">${results.reflection.showUpOften}</p>
                </div>
              ` : ''}
            </div>
          ` : ''}
        </div>
        
        <div class="results-card" style="margin-top: 20px; background: white;">
          <h4 style="color: #6C9571; margin-top: 0;">🌿 A Gentle Reminder</h4>
          <p style="margin-bottom: 0;">These patterns aren't labels — they're clues. Use them to notice where you might need more support, rest, or gentle change. Awareness is the first step toward balance.</p>
        </div>
        
        <div class="footer">
          <p style="margin-bottom: 10px;">✨ Thank you for taking this time for yourself</p>
          <p style="font-size: 0.9rem; opacity: 0.8;">
            Visit us again at <a href="https://brilliant-pastelito-6888d3.netlify.app">Well with Avril</a> for more quizzes and insights.
          </p>
          <p style="font-size: 0.8rem; color: #999; margin-top: 15px;">
            Completed: ${new Date(results.completedDate).toLocaleString()}
          </p>
        </div>
      </div>
    </body>
    </html>
  `;
}

function generateStressAdminEmailHTML(results, userEmail, userName) {
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
        .category-breakdown {
          background: #f8f9fa;
          border-radius: 10px;
          padding: 15px;
          margin: 15px 0;
        }
        .category-title {
          font-weight: 600;
          color: #6C9571;
          margin-bottom: 5px;
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
        <h2>📊 New Stress Pattern Results</h2>
        
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
            <span class="info-label">Total:</span>
            <span class="info-value"><strong>${results.totalChecked}</strong> patterns checked</span>
          </div>
        </div>
        
        <h3 style="color: #6C9571;">Category Breakdown:</h3>
        
        ${results.categoryCounts.map(cat => `
          <div class="category-breakdown">
            <div class="category-title">${cat.emoji} ${cat.name}</div>
            <div style="margin: 5px 0; font-size: 0.9rem;">
              <strong>${cat.count}/${cat.total}</strong> patterns checked
            </div>
            ${cat.count > 0 ? `
              <details style="margin-top: 8px;">
                <summary style="color: #6C9571; cursor: pointer; font-size: 0.9rem;">
                  View checked patterns (${cat.count})
                </summary>
                <ul style="margin-top: 8px; padding-left: 20px; font-size: 0.85rem;">
                  ${cat.patterns.map(p => `<li>${p}</li>`).join('')}
                </ul>
              </details>
            ` : '<p style="color: #999; font-style: italic; font-size: 0.85rem;">No patterns checked</p>'}
          </div>
        `).join('')}
        
        ${results.reflection && (results.reflection.otherPatterns || results.reflection.topThree.filter(t => t).length > 0 || results.reflection.showUpOften) ? `
          <h3 style="color: #6C9571; margin-top: 20px;">Reflection Answers:</h3>
          <div style="background: #f8f9fa; border-radius: 10px; padding: 15px;">
            ${results.reflection.otherPatterns ? `
              <p><strong>Other patterns:</strong><br>${results.reflection.otherPatterns}</p>
            ` : ''}
            
            ${results.reflection.topThree.filter(t => t).length > 0 ? `
              <p><strong>Top 3 draining patterns:</strong></p>
              <ol style="margin-top: -5px;">
                ${results.reflection.topThree.filter(t => t).map(p => `<li>${p}</li>`).join('')}
              </ol>
            ` : ''}
            
            ${results.reflection.showUpOften ? `
              <p><strong>Show up often?</strong> ${results.reflection.showUpOften}</p>
            ` : ''}
          </div>
        ` : ''}
        
        <hr>
        <p style="color: #666; font-size: 0.85rem; text-align: center;">
          This is an admin notification for a completed stress pattern quiz.
        </p>
      </div>
    </body>
    </html>
  `;
}