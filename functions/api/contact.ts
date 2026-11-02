export interface Env {
	// Add bindings here if needed (KV, D1, R2, etc.)
}

export interface ContactFormData {
	name: string
	email: string
	project: string
	message: string
}

export const onRequestPost: (context: { request: Request; env: Env }) => Promise<Response> = async (context) => {
	const { request, env } = context

	try {
		const body = await request.json() as ContactFormData

		// Validate required fields
		if (!body.name || !body.email || !body.message) {
			return new Response(JSON.stringify({ error: 'Missing required fields' }), {
				status: 400,
				headers: { 'Content-Type': 'application/json' },
			})
		}

		// Validate email format
		const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
		if (!emailRegex.test(body.email)) {
			return new Response(JSON.stringify({ error: 'Invalid email format' }), {
				status: 400,
				headers: { 'Content-Type': 'application/json' },
			})
		}

		// Log the submission (visible in Cloudflare Pages Functions logs)
		const submission = {
			timestamp: new Date().toISOString(),
			name: body.name,
			email: body.email,
			project: body.project || 'Not specified',
			message: body.message,
			userAgent: request.headers.get('User-Agent'),
			ip: request.headers.get('CF-Connecting-IP') || 'unknown',
		}

		console.log('Contact form submission:', JSON.stringify(submission, null, 2))

		// TODO: Add email sending here when you have credentials
		// Example with SendGrid:
		// await sendEmail(env.SENDGRID_API_KEY, submission)
		// Example with Mailgun:
		// await sendEmailMailgun(env.MAILGUN_API_KEY, env.MAILGUN_DOMAIN, submission)

		// For now, just log and return success
		return new Response(JSON.stringify({ success: true, message: 'Form submitted successfully' }), {
			status: 200,
			headers: { 'Content-Type': 'application/json' },
		})
	} catch (error) {
		console.error('Contact form error:', error)
		return new Response(JSON.stringify({ error: 'Internal server error' }), {
			status: 500,
			headers: { 'Content-Type': 'application/json' },
		})
	}
}

// Helper function for SendGrid (uncomment and add SENDGRID_API_KEY to env when ready)
/*
async function sendEmail(apiKey: string, submission: any) {
	const msg = {
		to: 'your-email@example.com', // Change to your email
		from: 'portfolio@yourdomain.com', // Verified sender in SendGrid
		subject: `Portfolio Contact: ${submission.name}`,
		text: `
Name: ${submission.name}
Email: ${submission.email}
Project: ${submission.project}
Message: ${submission.message}
		`,
		html: `
<h2>New Contact Form Submission</h2>
<p><strong>Name:</strong> ${submission.name}</p>
<p><strong>Email:</strong> ${submission.email}</p>
<p><strong>Project:</strong> ${submission.project}</p>
<p><strong>Message:</strong></p>
<p>${submission.message.replace(/\n/g, '<br>')}</p>
<hr>
<p><small>Submitted at ${submission.timestamp} from ${submission.ip}</small></p>
		`,
	}
	await fetch('https://api.sendgrid.com/v3/mail/send', {
		method: 'POST',
		headers: {
			Authorization: `Bearer ${apiKey}`,
			'Content-Type': 'application/json',
		},
		body: JSON.stringify({ personalizations: [{ to: [{ email: msg.to }] }], from: { email: msg.from }, subject: msg.subject, content: [{ type: 'text/html', value: msg.html }] }),
	})
}
*/

// Helper function for Mailgun (uncomment and add MAILGUN_API_KEY, MAILGUN_DOMAIN to env when ready)
/*
async function sendEmailMailgun(apiKey: string, domain: string, submission: any) {
	const formData = new FormData()
	formData.append('from', `Portfolio <portfolio@${domain}>`)
	formData.append('to', 'your-email@example.com')
	formData.append('subject', `Portfolio Contact: ${submission.name}`)
	formData.append('text', `
Name: ${submission.name}
Email: ${submission.email}
Project: ${submission.project}
Message: ${submission.message}
	`)
	await fetch(`https://api.mailgun.net/v3/${domain}/messages`, {
		method: 'POST',
		headers: { Authorization: `Basic ${btoa(`api:${apiKey}`)}` },
		body: formData,
	})
}
*/