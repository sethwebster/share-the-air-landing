import React, { useEffect, useState } from "react"
import { graphql } from "gatsby"
import Img from "gatsby-image"

import Layout from "../components/layout"
import SEO from "../components/seo"

import "@fortawesome/fontawesome-free/css/all.min.css"
import logo from "../images/icon.png"
import configs from "../../site-config"
import Axios from "axios"
import moment from "moment"
import {
  StripeProvider,
  Elements,
  injectStripe,
  CardElement,
} from "react-stripe-elements"

function getQueryStringValue(key) {
  return decodeURIComponent(
    window.location.search.replace(
      new RegExp(
        "^(?:.*[&\\?]" +
          encodeURIComponent(key).replace(/[\.\+\*]/g, "\\$&") +
          "(?:\\=([^&]*))?)?.*$",
        "i"
      ),
      "$1"
    )
  )
}
function customerToken() {
  return getQueryStringValue("token")
}

const buttonStyles = {
  marginTop: "15px",
  fontSize: "13px",
  textAlign: "center",
  color: "#111",
  outline: "none",
  padding: "12px 60px",
  boxShadow: "2px 5px 10px rgba(0,0,0,.1)",
  backgroundColor: "rgb(255, 178, 56)",
  borderRadius: "6px",
  letterSpacing: "1.5px",
  width: "100%",
}

const loadSubscriptions = async token => {
  return (await Axios.get(`${configs.api_url}/subscriptions`, {
    headers: { Authorization: `Bearer ${token}` },
  })).data
  // setSubscription(result.data)
  // setUserEmail(result.data.email)
  // setIsLoaded(true)
}

const processPayment = async (paymentMethod, token) => {
  return (await Axios.post(
    `${configs.api_url}/subscriptions/payment`,
    paymentMethod,
    {
      headers: { Authorization: `Bearer ${token}` },
    }
  )).data
  // setSubscription(result.data)
  // setUserEmail(result.data.email)
  // setIsLoaded(true)
}

function CustomerSubscriptions({ subscription }) {
  return (
    <div
      style={{
        textAlign: "center",
        fontFamily: "sans-serif",
        fontSize: "1.0em",
        opacity: "0.95",
      }}
    >
      <div
        style={{
          borderRadius: 75,
          border: "1px solid rgba(0,0,0,0.5)",
          boxShadow: "1px 1px 5px #888888",
          height: 150,
          width: 150,
          overflow: "hidden",
          margin: "0 auto 40px auto",
        }}
      >
        <img src={logo} style={{ height: "100%", width: "100%" }} />
      </div>
      {subscription.status === "active" && (
        <>
          <div>
            <h3 style={{ marginTop: 10 }}>Start Date</h3>
            <>{moment.unix(subscription.startDate).format("ll")} </>
            <h3 style={{ marginTop: 10 }}>Next Bill Date</h3>
            <>{moment.unix(subscription.endDate).format("ll")}</>
          </div>
        </>
      )}
      {subscription.status !== "active" && (
        <div style={{ margin: "20px" }}>
          <p>Take to the skies for just $9.99/mo</p>
        </div>
      )}
    </div>
  )
}

// const Checkout = class extends React.Component {
//   state = {
//     email: null,
//   }
//   // Initialise Stripe.js with your publishable key.
//   // You can find your key in the Dashboard:
//   // https://dashboard.stripe.com/account/apikeys
//   componentDidMount() {
//     this.stripe = window.Stripe("pk_test_GbzzIDUn5IiwCbX7WFDyeqKl00OsIGjTpi", {
//       // betas: ["checkout_beta_4"],
//     })
//   }

//   redirectToCheckout = async event => {
//     const { email } = this.state
//     console.log("email", email)
//     event.preventDefault()
//     const { error } = await this.stripe.redirectToCheckout({
//       items: [{ plan: "plan_Exx6E6byFa1XIx", quantity: 1 }],
//       successUrl: `http://localhost:8000/payment-success/`,
//       cancelUrl: `http://localhost:8000/payment-canceled`,
//       // rememberMe: true,
//       // customerEmail: email,
//       customer: { id: "cus_Exx8MDsV3EJGhW" },
//     })

//     if (error) {
//       console.warn("Error:", error)
//     }
//   }

//   render() {
//     return (
//       <>
//         <CustomerSubscriptions
//           token={customerToken()}
//           redirectToCheckout={this.redirectToCheckout}
//           setUserEmail={email => this.setState({ email })}
//         />
//       </>
//     )
//   }
// }

class CardSection extends React.Component {
  handleRef = ref => {
    const { cardElementRefHandler } = this.props
    if (cardElementRefHandler) cardElementRefHandler(ref)
  }
  render() {
    return (
      <label>
        Card details
        <hr />
        <br />
        <CardElement
          ref={this.handleRef}
          style={{ base: { fontSize: "18px" } }}
        />
      </label>
    )
  }
}

class CheckoutForm extends React.Component {
  state = {
    inProgress: false,
    complete: false,
    error: false,
  }
  handleSubmit = ev => {
    const { email } = this.props
    const { cardElement } = this.state
    // We don't want to let default form submission happen here, which would refresh the page.
    ev.preventDefault()
    // // Within the context of `Elements`, this call to createPaymentMethod knows from which Element to
    // // create the PaymentMethod, since there's only one in this group.
    // // See our createPaymentMethod documentation for more:
    // // https://stripe.com/docs/stripe-js/reference#stripe-create-payment-method
    this.setState({ inProgress: true })
    this.props.stripe
      .createSource({
        type: "card",
        owner: {
          email: email,
        },
      })
      .then(res => {
        console.log(res)
      })

    this.props.stripe
      .createPaymentMethod("card", { billing_details: { email } })
      .then(async ({ paymentMethod }) => {
        const result = await processPayment(paymentMethod, customerToken())
        console.log(result)
        this.setState({ inProgress: false })
        if (result.status === "active") {
          this.setState({ complete: true })
        } else {
          this.setState({ error: true })
        }
      })
    // // You can also use handleCardPayment with the Payment Intents API automatic confirmation flow.
    // // See our handleCardPayment documentation for more:
    // // https://stripe.com/docs/stripe-js/reference#stripe-handle-card-payment

    // // You can also use createToken to create tokens.
    // // See our tokens documentation for more:
    // // https://stripe.com/docs/stripe-js/reference#stripe-create-token
    // this.props.stripe.createToken({ type: "card", name: "Jenny Rosen" })
    // // token type can optionally be inferred if there is only one one Element
    // // with which to create tokens
    // // this.props.stripe.createToken({name: 'Jenny Rosen'});
    // // You can also use createSource to create Sources.
    // // See our Sources documentation for more:
    // // https://stripe.com/docs/stripe-js/reference#stripe-create-source
  }

  render() {
    const { email } = this.props
    const { inProgress = false, complete, error } = this.state
    if (complete) {
      return <div style={styles.complete}>Your subscription is confirmed!</div>
    }
    return (
      <form onSubmit={this.handleSubmit} style={{ width: "100%" }}>
        {/* <AddressSection /> */}
        {error && <div style={styles.errors}>Your subscription failed.</div>}
        <div
          style={{
            opacity: inProgress ? "0.5" : "1",
            fontSize: "0.8em",
          }}
        >
          <CardSection
            cardElementRefHandler={ref => {
              this.setState({ cardElement: ref })
            }}
          />
          <button style={buttonStyles} disabled={inProgress}>
            Confirm order
          </button>
        </div>
      </form>
    )
  }
}

const InjectedCheckoutForm = injectStripe(CheckoutForm)

const ElementsFormWrapper = ({ email }) => {
  return (
    <Elements>
      <InjectedCheckoutForm email={email} />
    </Elements>
  )
}

const PaymentForm = () => {
  const [subscription, setSubscription] = useState(null)

  useEffect(() => {
    loadSubscriptions(customerToken()).then(setSubscription)
  }, [])

  if (!subscription) return <></>
  console.log("COMP", subscription.status !== "active")
  return (
    <Layout>
      <div style={{ width: "400px", margin: "0 auto 0 auto" }}>
        <CustomerSubscriptions subscription={subscription} />
        {subscription.status !== "active" && (
          <StripeProvider apiKey={"pk_test_GbzzIDUn5IiwCbX7WFDyeqKl00OsIGjTpi"}>
            <ElementsFormWrapper email={subscription.email} />
          </StripeProvider>
        )}
      </div>
    </Layout>
  )
}

const styles = {
  errors: {
    padding: 10,
    backgroundColor: "rgba(252, 251, 201, 0.8)",
    border: "1px solid rgb(178, 176, 101)",
    borderRadius: "5px",
    margin: "10px 0 10px 0",
    color: "red",
    boxShadow: "2px 5px 10px rgba(0,0,0,.1)",
  },
  complete: {
    padding: 10,
    backgroundColor: "rgba(8, 206, 31, 0.8)",
    border: "1px solid #159924",
    borderRadius: "5px",
    margin: "10px 0 10px 0",
    color: "white",
    boxShadow: "2px 5px 10px rgba(0,0,0,.1)",
  },
}

export default PaymentForm
