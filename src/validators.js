export const required = value => (value ? undefined: 'Required')
export const mustBeUUID = value => value.match(/[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}/) ? undefined : 'Must be UUID'
export const mustBePDF = value => typeof(value) === 'undefined' || value.match(/\.pdf$/) ? undefined : 'Must be PDF'
export const composeValidators = (...validators) => value =>
    validators.reduce((error, validator) => error || validator(value), undefined)
