import { expect } from 'chai'
import { BasicExtrationRule, shouldExtract } from '../../../../src/core/extraction'

const rules = [
  new BasicExtrationRule(),
]

const includes = [
  't',
  'OK',
  'Created',
  '✅',
  'Follow this link: https://lokalise.com/features/in-context-editing',
  '<a href="mailto:some@example.com">some@example.com</a>',
  'Our region is us-east-1.',
]

const excludes = [
  'security/login.html.twig',
  'api/*',
  'https://lokalise.com/features/in-context-editing',
  'http://localhost',
  'other:example',
  'some@example.com',
  'user.updated_successfully',
  'lokalise.service.plan',
  'lokalise.service.elastic_search',
  'ROLE_USER',
  'adminIndex',
  'admin_index',
  'main-container-class',
  'Fideloper\\Proxy\\TrustedProxyServiceProvider',
  'us-east-1',
  'App.Models.User.{id}',
  '$2y$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi',
  ':boom:',
  'php://stderr',
  '127.0.0.1',
  '0',
  '', // empty string
  '/',
  ' : ',
]

describe('extraction-basic', () => {
  it('should includes', () => {
    const excluded = includes.filter(str => !shouldExtract(str, rules))
    expect(excluded).eql([])
  })

  it('should exclude', () => {
    const included = excludes.filter(str => shouldExtract(str, rules))
    expect(included).eql([])
  })
})
