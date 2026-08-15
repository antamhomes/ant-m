/// <reference types="npm:@types/react@18.3.1" />
import * as React from 'npm:react@18.3.1'
import {
  Body,
  Container,
  Head,
  Heading,
  Hr,
  Html,
  Preview,
  Section,
  Text,
} from 'npm:@react-email/components@0.0.22'
import type { TemplateEntry } from './registry.ts'

const SITE_NAME = 'antam homes'

interface ContactInquiryProps {
  name?: string
  email?: string
  phone?: string
  address?: string
  size?: string
  message?: string
}

const ContactInquiryEmail = ({
  name,
  email,
  phone,
  address,
  size,
  message,
}: ContactInquiryProps) => (
  <Html lang="cs" dir="ltr">
    <Head />
    <Preview>Nová poptávka z webu antam homes</Preview>
    <Body style={main}>
      <Container style={container}>
        <Heading style={h1}>Nová poptávka z webu</Heading>
        <Text style={text}>
          Přišla nová poptávka přes formulář na webu {SITE_NAME}.
        </Text>

        <Section style={card}>
          <Text style={label}>Jméno</Text>
          <Text style={value}>{name || '—'}</Text>
          <Hr style={divider} />
          <Text style={label}>Email</Text>
          <Text style={value}>{email || '—'}</Text>
          <Hr style={divider} />
          <Text style={label}>Telefon</Text>
          <Text style={value}>{phone || '—'}</Text>
          <Hr style={divider} />
          <Text style={label}>Adresa nemovitosti</Text>
          <Text style={value}>{address || '—'}</Text>
          <Hr style={divider} />
          <Text style={label}>Velikost bytu</Text>
          <Text style={value}>{size || '—'}</Text>
          <Hr style={divider} />
          <Text style={label}>Zpráva</Text>
          <Text style={messageStyle}>{message || '—'}</Text>
        </Section>

        <Text style={footer}>
          Tato zpráva byla automaticky odeslána z webu {SITE_NAME}.
        </Text>
      </Container>
    </Body>
  </Html>
)

export const template = {
  component: ContactInquiryEmail,
  subject: (data: Record<string, any>) =>
    `Nová poptávka${data?.name ? ` od ${data.name}` : ''} – ${SITE_NAME}`,
  // Fixed recipient: the edge function ignores the caller-supplied recipientEmail
  // whenever a template defines `to`, so the form can only ever email this inbox.
  to: 'antamhomes@gmail.com',
  displayName: 'Poptávka z kontaktního formuláře',
  previewData: {
    name: 'Jan Novák',
    email: 'jan.novak@example.com',
    phone: '+420 777 123 456',
    address: 'Praha 2, Vinohrady',
    size: '2+kk',
    message: 'Mám 2+kk byt v centru, zajímá mě správa Airbnb.',
  },
} satisfies TemplateEntry

const main = {
  backgroundColor: '#ffffff',
  fontFamily: '"DM Sans", Arial, sans-serif',
}
const container = { padding: '32px 24px', maxWidth: '560px' }
const h1 = {
  fontSize: '24px',
  fontWeight: 'bold',
  color: '#1a3a2a',
  fontFamily: '"Playfair Display", Georgia, serif',
  margin: '0 0 16px',
}
const text = { fontSize: '15px', color: '#55575d', lineHeight: '1.6', margin: '0 0 24px' }
const card = {
  backgroundColor: '#faf8f3',
  border: '1px solid #e8e2d4',
  borderRadius: '6px',
  padding: '24px',
  margin: '0 0 24px',
}
const label = {
  fontSize: '11px',
  letterSpacing: '0.15em',
  textTransform: 'uppercase' as const,
  color: '#a08856',
  margin: '0 0 4px',
  fontWeight: 600,
}
const value = { fontSize: '15px', color: '#1a1a1a', margin: '0 0 4px', lineHeight: '1.5' }
const messageStyle = { ...value, whiteSpace: 'pre-wrap' as const }
const divider = { borderColor: '#e8e2d4', margin: '16px 0' }
const footer = { fontSize: '12px', color: '#999999', margin: '32px 0 0', textAlign: 'center' as const }
