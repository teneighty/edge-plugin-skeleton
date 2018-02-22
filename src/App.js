import PropTypes from 'prop-types'
import React from 'react'
import { HashRouter as Router, Route } from 'react-router-dom'
import { createForm } from 'rc-form'
import { core, ui } from 'edge-libplugin'

import './inline.css'

const USER_INFO_KEY = 'simplex-userinfo'

const readProfile = () => {
  return core.readData(USER_INFO_KEY)
}

let PROFILE = {
  personal_first_name: 'Timbo'
}

const updateProfile = async (data) => {
  let profile = await readProfile()
  if (profile) {
    Object.keys(data).forEach(k => {
      profile[k] = data[k]
    })
  } else {
    profile = data
  }
  await core.writeData(USER_INFO_KEY, profile)
  PROFILE = profile
}

class StartScene extends React.Component {
  componentWillMount () {
    ui.title('Simplex')
  }
  _start = async () => {
    const isSetup = await core.readData('setup') === true
    if (isSetup) {
      this.props.history.push('/fullView/')
    } else {
      this.props.history.push('/personalInfo/')
    }
  }
  render () {
    return (
      <div>
        <div className="text-center">
          <div className="iconLogo" />
        </div>
        <div className="block">
          <h3>Simplex</h3>
          <p>
            Simplex is a Edge Wallet bank card processing partner. It is the
            service which allows you to purchase Bitcoin safely and quickly in just a
            few short minutes.
          </p>
        </div>
        <div className="block">
          <h3>Fee</h3>
          <p>
            Please note that additional fees will be charged, on top of the above Bitcoin / $ rate at checkout. Those fees are as follows:
          </p>
          <ul>
            <li>Edge Wallet 5%</li>
            <li>Credit Card processing by Simplex 5% ($10 min)</li>
          </ul>
        </div>
        <div className="block">
          <h3>Time</h3>
          <p>
            Estimated transaction time is about 10-30min.
          </p>
        </div>
        <div className="block">
          <h3>Support</h3>
          <p>
            For support, please contact <a href="mailto:support@simplex.com">support@simplex.com</a>.
          </p>
        </div>
        <div className="block text-center">
          <button onClick={this._start}>Choose Wallet to Receive Bitcoin</button>
        </div>
      </div>
    )
  }
}

StartScene.propTypes = {
  history: PropTypes.object
}

const Block = (props) => {
  return (
    <div>
      <div className="text-center">
        <div className={props.iconClassName} />
        <h3>{props.title}</h3>
      </div>
      <div className="block">{props.children}</div>
    </div>
  )
}

Block.propTypes = {
  title: PropTypes.string,
  iconClassName: PropTypes.string,
  children: PropTypes.node.isRequired
}

const ErrorElement = (props) => {
  if (props.errors) {
    return (
      <div className="error">
        {props.errors.join(',')}
      </div>
    )
  } else {
    return null
  }
}

ErrorElement.propTypes = {
  errors: PropTypes.array
}

class ValidatedInput extends React.Component {
  componentWillMount () {
    const optional = this.props.optional && this.props.optional === true
    this.decorator = this.props.form.getFieldDecorator(
      this.props.name, {
        rules: [{required: !optional}]
      })
  }
  render () {
    return (
      <div>
        {this.decorator(
          <input
            type={this.props.type || 'text'}
            placeholder={this.props.name}
            defaultValue={this.props.value}
          />
        )}
        <ErrorElement errors={this.props.form.getFieldError(this.props.name)} />
      </div>
    )
  }
}

ValidatedInput.propTypes = {
  optional: PropTypes.bool,
  form: PropTypes.object,
  name: PropTypes.string,
  type: PropTypes.string,
  value: PropTypes.string
}

class _PersonalInfoForm extends React.Component {
  render () {
    return (
      <div>
        <div className="w-100">
          <ValidatedInput
            name="First Name"
            form={this.props.form}
            value={PROFILE.personal_first_name}
          />
        </div>
        <div className="w-100">
          <ValidatedInput
            name="Last Name"
            form={this.props.form}
            value={PROFILE.personal_last_name || ''}
          />
        </div>
        <div className="w-100">
          <ValidatedInput
            name="Email"
            form={this.props.form}
            type="email"
            value={PROFILE.personal_email}
          />
        </div>
        <div>
          <div className="w-50 p-2">
            <ValidatedInput
              name="Mobile Phone"
              form={this.props.form}
              type="phone"
              value={PROFILE.personal_mobile_phone} />
          </div>
          <div className="w-50 p-2">
            <ValidatedInput
              name="Date of Birth"
              form={this.props.form}
              type="date"
              value={PROFILE.personal_date_of_birth}
            />
          </div>
        </div>
      </div>
    )
  }
}

_PersonalInfoForm.propTypes = {
  form: PropTypes.object
}

const PersonalInfoForm = createForm()(_PersonalInfoForm)
class PersonalInfoScene extends React.Component {
  async componentWillMount () {
    ui.title('Personal Information')
  }
  _next = () => {
    this.form.getForm().validateFields((error, value) => {
      if (!error) {
        updateProfile({
          personal_first_name: value['First Name'],
          personal_last_name: value['Last Name'],
          personal_email: value['Email'],
          personal_mobile_phone: value['Mobile Phone'],
          personal_date_of_birth: value['Date of Birth']
        })
        // serialize form
        this.props.history.push('/paymentInfo/')
      }
    })
  }
  render () {
    return (
      <Block iconClassName="iconProfile" title="Personal Info">
        <PersonalInfoForm ref={(el) => { this.form = el }}/>
        <button onClick={this._next}>Next</button>
      </Block>
    )
  }
}

PersonalInfoScene.propTypes = {
  history: PropTypes.object
}

class _PaymentInfoForm extends React.Component {
  render () {
    return (
      <div>
        <div className="w-100">
          <ValidatedInput name="First Name" form={this.props.form} />
        </div>
        <div className="w-100">
          <ValidatedInput name="Last Name" form={this.props.form} />
        </div>
        <div className="w-100">
          <ValidatedInput name="Card Number" form={this.props.form} />
        </div>
        <div>
          <div className="w-50 p-2">
            <ValidatedInput name="Expiration Date" form={this.props.form} />
          </div>
          <div className="w-50 p-2">
            <ValidatedInput name="CCV" form={this.props.form} />
          </div>
        </div>
      </div>
    )
  }
}

_PaymentInfoForm.propTypes = {
  form: PropTypes.object
}

const PaymentInfoForm = createForm()(_PaymentInfoForm)
class PaymentInfoScene extends React.Component {
  componentWillMount () {
    ui.title('Payment Information')
  }
  _next = () => {
    this.form.getForm().validateFields((error, value) => {
      if (!error) {
        updateProfile({
          billing_first_name: value['First Name'],
          billing_last_name: value['Last Name'],
          billing_card_number: value['Card Number'],
          billing_expiration_date: value['Expiration Date'],
          billing_ccv: value['CCV']
        })
        this.props.history.push('/billingAddressScene/')
      }
    })
  }
  render () {
    return (
      <Block iconClassName="iconPayment" title="Personal Info">
        <PaymentInfoForm ref={(el) => { this.form = el }} />
        <button onClick={this._next}>Next</button>
      </Block>
    )
  }
}

PaymentInfoScene.propTypes = {
  history: PropTypes.object
}

class _BillingAddressForm extends React.Component {
  render () {
    return (
      <div>
        <div className="w-100">
          <ValidatedInput name="Address" form={this.props.form} />
        </div>
        <div className="w-100">
          <ValidatedInput name="Address 2 (optional)" optional form={this.props.form} />
        </div>
        <div>
          <div className="w-50 p-2">
            <ValidatedInput name="City" form={this.props.form} />
          </div>
          <div className="w-50 p-2">
            <ValidatedInput name="Postal Code" form={this.props.form} />
          </div>
        </div>
        <div className="w-100">
          <ValidatedInput name="Country" form={this.props.form} />
        </div>
      </div>
    )
  }
}

_BillingAddressForm.propTypes = {
  form: PropTypes.object
}

const BillingAddressForm = createForm()(_BillingAddressForm)
class BillingAddressScene extends React.Component {
  componentWillMount () {
    ui.title('Billing Address')
  }
  _next = () => {
    this.form.getForm().validateFields((error, value) => {
      if (!error) {
        updateProfile({
          billing_address_1: value['Address'],
          billing_address_2: value['Address 2'],
          billing_city: value['City'],
          billing_postal_code: value['Postal Code'],
          billing_country: value['Country']
        })
        this.props.history.push('/uploadId/')
      }
    })
  }
  render () {
    return (
      <Block iconClassName="iconPayment" title="Billing Address">
        <BillingAddressForm ref={(el) => { this.form = el }} />
        <button onClick={this._next}>Next</button>
      </Block>
    )
  }
}

BillingAddressScene.propTypes = {
  history: PropTypes.object.required
}

class UploadIdScene extends React.Component {
  componentWillMount () {
    ui.title('I.D. Upload')
  }
  _upload = async () => {
    try {
      await core.requestFile()
      window.alert('Thanks for the fish. One day I will upload it to simplex!')
      await core.writeData('setup', true)
      this.props.history.push('https://www.simplex.com/')
    } catch (e) {
      console.log(e)
    }
  }
  render () {
    return (
      <div>
        <div className="text-center">
          <div className="iconId" />
          <h3>Upload your I.D.</h3>
          <p>Please upload a valid government issues I.D.</p>
          <p>Image must be a colored, high quality copy with the expiry date cleary visible. The file must be smaller than 4MB.</p>
        </div>
        <div className="block text-center">
          <button onClick={this._upload}>Attach Photo</button>
        </div>
      </div>
    )
  }
}

UploadIdScene.propTypes = {
  history: PropTypes.object.required
}

class FullViewScene extends React.Component {
  componentWillMount () {
    ui.title('Personal Information')
  }
  _edit = () => {
    this.props.history.push('/fullEdit/')
  }
  _next = () => {
    this.props.history.push('https://www.simplex.com/')
  }
  render () {
    return (
      <div>
        <div className="text-center">
          <div className="iconId" />
        </div>
        <div className="block text-center">
          <button className="w-50" onClick={this._edit}>Edit</button>
          <button className="w-50" onClick={this._next}>Next</button>
        </div>
      </div>
    )
  }
}

FullViewScene.propTypes = {
  history: PropTypes.object.required
}

class FullEditScene extends React.Component {
  componentWillMount () {
    ui.title('Edit Information')
  }
  _save = () => {
    this.props.history.goBack()
  }
  render () {
    return (
      <div>
        <div className="text-center">
          <div className="iconId" />
        </div>
        <div className="block text-center">
          <button onClick={this._save}>Save</button>
        </div>
      </div>
    )
  }
}

FullEditScene.propTypes = {
  history: PropTypes.object.required
}

export const routes = [{
  path: '/',
  main: StartScene,
  exact: true
}, {
  path: '/personalInfo/',
  main: PersonalInfoScene,
  exact: true
}, {
  path: '/paymentInfo/',
  main: PaymentInfoScene,
  exact: true
}, {
  path: '/billingAddressScene/',
  main: BillingAddressScene,
  exact: true
}, {
  path: '/uploadId/',
  main: UploadIdScene,
  exact: true
}, {
  path: '/fullView/',
  main: FullViewScene,
  exact: true
}, {
  path: '/fullEdit/',
  main: FullEditScene,
  exact: true
}]

class App extends React.Component {
  componentWillMount () {
    readProfile()
      .then((data) => {
        PROFILE = data
      })
      .catch((err) => {
        window.alert(err)
      })
  }
  render () {
    return (
      <Router>
        <div id='content'>
          {routes.map((route, index) => (
            <Route
              key={index}
              path={route.path}
              exact={route.exact}
              component={route.main}
            />
          ))}
        </div>
      </Router>
    )
  }
}

export default App
