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
}

function CustomerSubscriptions({ token, redirectToCheckout, setUserEmail }) {
  const [isLoaded, setIsLoaded] = useState(false)
  const [subscription, setSubscription] = useState(null)
  console.log(isLoaded)

  const loadSubscriptions = async (token, setSubscription, setIsLoaded) => {
    const result = await Axios.get(
      `https://sharetheair.pagekite.me/api/subscriptions?tok=${token}`,
      {
        headers: { Authorization: `Bearer ${token}` },
      }
    )
    setSubscription(result.data)
    setUserEmail(result.data.email)
    setIsLoaded(true)
  }

  useEffect(() => {
    loadSubscriptions(token, setSubscription, setIsLoaded)
  }, [false])

  return (
    <div
      style={{
        textAlign: "center",
        fontFamily: "Sans-Serif",
        fontSize: "1.2em",
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
      {isLoaded && subscription.status === "active" && (
        <>
          <div>
            <h3 style={{ marginTop: 10 }}>Start Date</h3>
            <>{moment.unix(subscription.startDate).format("ll")} </>
            <h3 style={{ marginTop: 10 }}>Next Bill Date</h3>
            <>{moment.unix(subscription.endDate).format("ll")}</>
          </div>
          <button
            style={buttonStyles}
            onClick={event => redirectToCheckout(event)}
          >
            Cancel
          </button>
        </>
      )}
      {isLoaded && subscription.status !== "active" && (
        <div>
          <p>Take to the skies for just $9.99/mo</p>
          <button
            style={buttonStyles}
            onClick={event => redirectToCheckout(event)}
          >
            CONTINUE
          </button>
        </div>
      )}
    </div>
  )
}

const Checkout = class extends React.Component {
  state = {
    email: null,
  }
  // Initialise Stripe.js with your publishable key.
  // You can find your key in the Dashboard:
  // https://dashboard.stripe.com/account/apikeys
  componentDidMount() {
    this.stripe = window.Stripe("pk_test_GbzzIDUn5IiwCbX7WFDyeqKl00OsIGjTpi", {
      // betas: ["checkout_beta_4"],
    })
  }

  redirectToCheckout = async event => {
    const { email } = this.state
    console.log("email", email)
    event.preventDefault()
    const { error } = await this.stripe.redirectToCheckout({
      items: [{ plan: "plan_Exx6E6byFa1XIx", quantity: 1 }],
      successUrl: `http://localhost:8000/payment-success/`,
      cancelUrl: `http://localhost:8000/payment-canceled`,
      // rememberMe: true,
      // customerEmail: email,
      customer: { id: "cus_Exx8MDsV3EJGhW" },
    })

    if (error) {
      console.warn("Error:", error)
    }
  }

  render() {
    return (
      <>
        <CustomerSubscriptions
          token={customerToken()}
          redirectToCheckout={this.redirectToCheckout}
          setUserEmail={email => this.setState({ email })}
        />
      </>
    )
  }
}

const PrivacyPolicy = ({ data }) => (
  <Layout>
    <SEO title="Subscribe to Share the Air" keywords={configs.app_keywords} />
    <Checkout />
  </Layout>
)

export default PrivacyPolicy

export const query = graphql`
  query {
    headerIcon: file(relativePath: { eq: "icon.png" }) {
      childImageSharp {
        fluid(maxWidth: 50) {
          ...GatsbyImageSharpFluid
        }
      }
    }
    appStore: file(relativePath: { eq: "appstore.png" }) {
      childImageSharp {
        fixed(width: 220) {
          ...GatsbyImageSharpFixed
        }
      }
    }
    playStore: file(relativePath: { eq: "playstore.png" }) {
      childImageSharp {
        fixed(height: 75) {
          ...GatsbyImageSharpFixed
        }
      }
    }
    iphoneScreen: file(relativePath: { glob: "screenshot/*.png" }) {
      childImageSharp {
        fluid(maxWidth: 350) {
          ...GatsbyImageSharpFluid
        }
      }
    }
    videoScreen: file(
      extension: { ne: "txt" }
      relativePath: { glob: "videos/*" }
    ) {
      publicURL
      extension
    }
    appIconLarge: file(relativePath: { eq: "icon.png" }) {
      childImageSharp {
        fluid(maxWidth: 120) {
          ...GatsbyImageSharpFluid
        }
      }
    }
    headerImage: file(relativePath: { eq: "headerimage.png" }) {
      childImageSharp {
        fluid(maxHeight: 714) {
          ...GatsbyImageSharpFluid
        }
      }
    }
    iphonePreviewBlack: file(relativePath: { eq: "black.png" }) {
      childImageSharp {
        fluid(maxWidth: 400) {
          ...GatsbyImageSharpFluid
        }
      }
    }
    iphonePreviewBlue: file(relativePath: { eq: "blue.png" }) {
      childImageSharp {
        fluid(maxWidth: 400) {
          ...GatsbyImageSharpFluid
        }
      }
    }
    iphonePreviewCoral: file(relativePath: { eq: "coral.png" }) {
      childImageSharp {
        fluid(maxWidth: 400) {
          ...GatsbyImageSharpFluid
        }
      }
    }
    iphonePreviewWhite: file(relativePath: { eq: "white.png" }) {
      childImageSharp {
        fluid(maxWidth: 400) {
          ...GatsbyImageSharpFluid
        }
      }
    }
    iphonePreviewYellow: file(relativePath: { eq: "yellow.png" }) {
      childImageSharp {
        fluid(maxWidth: 400) {
          ...GatsbyImageSharpFluid
        }
      }
    }
  }
`
