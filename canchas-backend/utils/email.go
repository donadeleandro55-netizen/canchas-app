package utils

import (
	"fmt"
	"os"

	"github.com/resend/resend-go/v2"
)

func EnviarEmailConfirmacionReserva(destinatario string, nombre string, cancha string, fecha string, horaInicio string, horaFin string) error {
	apiKey := os.Getenv("RESEND_API_KEY")
	from := os.Getenv("EMAIL_FROM")

	client := resend.NewClient(apiKey)

	cuerpo := fmt.Sprintf(`
		<div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
			<h2 style="color: #16a34a;">⚽ Reserva Confirmada</h2>
			<p>Hola <strong>%s</strong>, tu reserva fue confirmada exitosamente.</p>
			<div style="background: #f0fdf4; padding: 20px; border-radius: 8px; margin: 20px 0;">
				<p><strong>Cancha:</strong> %s</p>
				<p><strong>Fecha:</strong> %s</p>
				<p><strong>Horario:</strong> %s - %s</p>
				<p><strong>Pago:</strong> Simulado ✅</p>
			</div>
			<p>¡Te esperamos en la cancha!</p>
		</div>
	`, nombre, cancha, fecha, horaInicio, horaFin)

	params := &resend.SendEmailRequest{
		From:    from,
		To:      []string{destinatario},
		Subject: "✅ Reserva confirmada - " + cancha,
		Html:    cuerpo,
	}

	_, err := client.Emails.Send(params)
	return err
}

func EnviarEmailCancelacionReserva(destinatario string, nombre string, cancha string, fecha string, horaInicio string) error {
	apiKey := os.Getenv("RESEND_API_KEY")
	from := os.Getenv("EMAIL_FROM")

	client := resend.NewClient(apiKey)

	cuerpo := fmt.Sprintf(`
		<div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
			<h2 style="color: #dc2626;">❌ Reserva Cancelada</h2>
			<p>Hola <strong>%s</strong>, tu reserva fue cancelada.</p>
			<div style="background: #fef2f2; padding: 20px; border-radius: 8px; margin: 20px 0;">
				<p><strong>Cancha:</strong> %s</p>
				<p><strong>Fecha:</strong> %s</p>
				<p><strong>Horario:</strong> %s</p>
			</div>
			<p>Si tenés alguna consulta contactanos.</p>
		</div>
	`, nombre, cancha, fecha, horaInicio)

	params := &resend.SendEmailRequest{
		From:    from,
		To:      []string{destinatario},
		Subject: "❌ Reserva cancelada - " + cancha,
		Html:    cuerpo,
	}

	_, err := client.Emails.Send(params)
	return err
}

func EnviarEmailCancelacionAdmin(destinatario string, nombre string, cancha string, fecha string, horaInicio string, precio float64) error {
	apiKey := os.Getenv("RESEND_API_KEY")
	from := os.Getenv("EMAIL_FROM")

	client := resend.NewClient(apiKey)

	cuerpo := fmt.Sprintf(`
		<div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
			<h2 style="color: #dc2626;">❌ Reserva Cancelada por el Complejo</h2>
			<p>Hola <strong>%s</strong>, lamentamos informarte que tu reserva fue cancelada por el administrador del complejo.</p>
			<div style="background: #fef2f2; padding: 20px; border-radius: 8px; margin: 20px 0;">
				<p><strong>Cancha:</strong> %s</p>
				<p><strong>Fecha:</strong> %s</p>
				<p><strong>Horario:</strong> %s</p>
			</div>
			<div style="background: #f0fdf4; padding: 20px; border-radius: 8px; margin: 20px 0;">
				<h3 style="color: #16a34a; margin: 0 0 10px;">💰 Devolución Simulada</h3>
				<p><strong>Monto a devolver:</strong> $%.0f</p>
				<p style="color: #6b7280; font-size: 14px;">La devolución será procesada en un plazo de 3 a 5 días hábiles.</p>
			</div>
			<p>Disculpá los inconvenientes. Ante cualquier consulta no dudes en contactarnos.</p>
		</div>
	`, nombre, cancha, fecha, horaInicio, precio)

	params := &resend.SendEmailRequest{
		From:    from,
		To:      []string{destinatario},
		Subject: "❌ Tu reserva fue cancelada - " + cancha,
		Html:    cuerpo,
	}

	_, err := client.Emails.Send(params)
	return err
}