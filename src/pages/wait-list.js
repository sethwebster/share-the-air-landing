import React, { useState } from "react"
import { graphql } from "gatsby"
import Img from "gatsby-image"

import Layout from "../components/layout"
import SEO from "../components/seo"

import "@fortawesome/fontawesome-free/css/all.min.css"
import styled from "styled-components"

import axios from "axios"

import configs from "../../site-config"

const StyledFormLabel = styled.label`
  display: block;
  font-family: ${configs.font};
  color: #fff !important;
  margin-top: 5px;
  margin-bottom: 3px;
`
const StyledTextInput = styled.input`
  width: 100%;
  padding: 10px;
  border: 0;
  border-radius: 2px;
  margin-bottom: 10px;
`

const StyledForm = styled.form`
  width: 100%;
  background-color: rgba(0, 0, 0, 0.5);
  border-radius: 2px;
  padding: 25px;
`

const SubmitButton = styled.button`
  padding: 10px;
  width: 100%;
  background-color: #3396e0;
  font-family: ${configs.font};
  font-weight: bold;
  color: rgba(255, 255, 255, 0.7);
  font-size: 0.9em;
  border: 0;
  border-radius: 4px;
`

const H2 = styled.h2`
  font-size: 3em;
  color: rgba(255, 255, 255, 0.8);
`

const P = styled.p`
  font-size: 0.9em;
  color: rgba(255, 255, 255, 1);
  margin: 5px 0px 15px 0px;
`

const ErrorMessage = styled.p`
  color: #ff0000;
`

const StyledSelect = styled.select`
  height: 30px;
`

const FormField = ({
  name,
  labelText,
  onChange,
  value,
  required,
  disabled,
  type = "text",
}) => {
  return (
    <div>
      <StyledFormLabel htmlFor={name}>{labelText}</StyledFormLabel>
      <StyledTextInput
        type={type}
        name={name}
        onChange={onChange}
        value={value}
        required={required}
        disabled={disabled}
      />
    </div>
  )
}

const TheForm = ({ onSubmit, disabled, error }) => {
  const [data, setData] = useState({
    email_address: "",
    FNAME: "",
    LNAME: "",
    CITY: "",
    STATE: "",
    POSTALCODE: "",
    DEVICE: "iPhone",
  })

  const submitted = e => {
    e.preventDefault()
    onSubmit(data)
  }

  const handleChange = e => {
    const copy = { ...data }
    console.log(copy[e.target.name])
    copy[e.target.name] = e.target.value
    setData(copy)
  }

  return (
    <StyledForm onSubmit={submitted}>
      <FormField
        name="email_address"
        type="email"
        labelText="Email Address"
        onChange={handleChange}
        value={data.email_address}
        required
        disabled={disabled}
      />
      <FormField
        name="FNAME"
        labelText="First Name"
        onChange={handleChange}
        value={data.FNAME}
        required
        disabled={disabled}
      />
      <FormField
        name="LNAME"
        labelText="Last Name"
        onChange={handleChange}
        value={data.LNAME}
        required
        disabled={disabled}
      />
      <div name="location" style={{ width: "100%" }}>
        <div style={{ float: "left", width: "35%", marginRight: "5%" }}>
          <FormField
            name="CITY"
            labelText="City"
            onChange={handleChange}
            value={data.CITY}
            required
            disabled={disabled}
          />
        </div>
        <div style={{ float: "left", width: "35%", marginRight: "5%" }}>
          <FormField
            name="STATE"
            labelText="State"
            onChange={handleChange}
            value={data.STATE}
            required
            disabled={disabled}
          />
        </div>
        <div style={{ float: "left", width: "20%" }}>
          <FormField
            name="POSTALCODE"
            labelText="Zip"
            onChange={handleChange}
            value={data.POSTALCODE}
            required
            disabled={disabled}
          />
        </div>
        <div>
          <StyledFormLabel htmlFor={"DEVICE"}>Type of Device</StyledFormLabel>

          <StyledSelect
            name="DEVICE"
            onChange={handleChange}
            value={data.DEVICE}
          >
            <option value="iPhone">iPhone</option>
            <option value="Android">Android</option>
            <option value="Other">Other</option>
          </StyledSelect>
        </div>
      </div>
      {error && <ErrorMessage>{error}</ErrorMessage>}
      <SubmitButton type="submit" value="Sign Up!" disabled={disabled}>
        Sign Up
      </SubmitButton>
    </StyledForm>
  )
}

const subscribe = async (
  formData,
  setInProgress,
  setStatus,
  status = "subscribed"
) => {
  await setInProgress(true)
  try {
    console.log("Submitting", formData)
    const response = await axios.post(configs.mailing_list_api_url, {
      ...formData,
      status,
    })
    console.log(response.data)
    setStatus({ state: "success" })
  } catch (ex) {
    const data = ex.response.data
    console.log(ex)
    if (data.status === false) {
      const { mailchimpResponse } = data
      console.log(mailchimpResponse)
      switch (mailchimpResponse.title) {
        case "Member Exists":
          setStatus({ state: "success" })
          break
        case "Forgotten Email Not Subscribed":
          if (status === "subscribed") {
            await subscribe(formData, setInProgress, setStatus, "pending")
            return
          } else {
            setStatus({
              state: "error",
              message:
                "Unable to complete registration: It seems you have unsubscribed previously.",
            })
          }
          break
        default:
          await setStatus({
            state: "error",
            message: "Failed: " + mailchimpResponse.title,
          })
      }
    }
  } finally {
    await setInProgress(false)
  }
}

const MAIL_MESSAGE =
  "Hello, <Friend>, \n\nI've just signed up for 'Share the Air', an online virtual flying club. Join me to use the app to plan our flights together.\n\nSee you there, \n\n<NAME>"

const makeMailMessage = name => {
  return encodeURI(MAIL_MESSAGE.replace("<NAME>", name))
}

const WaitListPage = ({ data }) => {
  const [inProgress, setInProgress] = useState(false)
  const [status, setStatus] = useState({ state: "pending", message: null })
  const [formData, setFormData] = useState({})
  return (
    <Layout>
      <SEO title="Home" keywords={configs.app_keywords} />

      <div
        className="imageWrapper"
        style={{
          backgroundImage: `linear-gradient(${
            configs.cover_overlay_color_rgba
          },${configs.cover_overlay_color_rgba}),url(${
            data.headerImage.childImageSharp.fluid.src
          })`,
        }}
      >
        <div className="headerBackground">
          <div className="container">
            <header>
              <div className="logo">
                <div className="appIconShadow">
                  <svg width="0" height="0">
                    <defs>
                      <clipPath id="shape">
                        <path
                          id="shape"
                          d="M6181.23,233.709v-1.792c0-.5-0.02-1-0.02-1.523a24.257,24.257,0,0,0-.28-3.3,11.207,11.207,0,0,0-1.04-3.132,10.683,10.683,0,0,0-1.95-2.679,10.384,10.384,0,0,0-2.68-1.943,10.806,10.806,0,0,0-3.13-1.038,19.588,19.588,0,0,0-3.3-.285c-0.5-.017-1-0.017-1.52-0.017h-22.39c-0.51,0-1.01.017-1.53,0.017a24.041,24.041,0,0,0-3.3.285,11.009,11.009,0,0,0-3.13,1.038,10.491,10.491,0,0,0-4.62,4.622,10.893,10.893,0,0,0-1.04,3.132,19.2,19.2,0,0,0-.28,3.3c-0.02.5-.02,1-0.02,1.523v22.392c0,0.5.02,1,.02,1.524a24.257,24.257,0,0,0,.28,3.3,10.9,10.9,0,0,0,1.04,3.132,10.491,10.491,0,0,0,4.62,4.622,11.04,11.04,0,0,0,3.13,1.038,19.891,19.891,0,0,0,3.3.285c0.51,0.017,1.01.017,1.53,0.017h22.39c0.5,0,1-.017,1.52-0.017a24.221,24.221,0,0,0,3.3-.285,10.836,10.836,0,0,0,3.13-1.038,10.408,10.408,0,0,0,2.68-1.943,10.683,10.683,0,0,0,1.95-2.679,11.217,11.217,0,0,0,1.04-3.132,20.257,20.257,0,0,0,.28-3.3c0.02-.5.02-1,0.02-1.524v-20.6h0Z"
                          transform="translate(-6131 -218)"
                        />
                      </clipPath>
                    </defs>
                  </svg>
                  <Img
                    fluid={data.headerIcon.childImageSharp.fluid}
                    className="headerIcon"
                  />
                </div>
                <p className="headerName">{configs.app_name}</p>
              </div>
              <nav>
                <ul>
                  {configs.presskit_download_link && (
                    <li>
                      <a href={configs.presskit_download_link}>Press Kit</a>
                    </li>
                  )}
                </ul>
              </nav>
            </header>
            <div
              className="iphonePreview"
              style={{
                backgroundImage: `url(${
                  configs.device_color === "black"
                    ? data.iphonePreviewBlack.childImageSharp.fluid.src
                    : configs.device_color === "blue"
                    ? data.iphonePreviewBlue.childImageSharp.fluid.src
                    : configs.device_color === "coral"
                    ? data.iphonePreviewCoral.childImageSharp.fluid.src
                    : configs.device_color === "white"
                    ? data.iphonePreviewWhite.childImageSharp.fluid.src
                    : data.iphonePreviewYellow.childImageSharp.fluid.src
                })`,
              }}
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                viewBox="0 0 0 0"
                style={{ position: "absolute" }}
              >
                <clipPath
                  id="screenMask"
                  clipPathUnits="objectBoundingBox"
                  transform="scale(.00257 .00119)"
                >
                  <path
                    d="M6490.24,1234.36H6216.28c-2.57,0-10.55-.07-12.07-0.07a87.524,87.524,0,0,1-12-1.03,40.051,40.051,0,0,1-11.4-3.79,38.315,38.315,0,0,1-16.82-16.84,39.948,39.948,0,0,1-3.78-11.42,72.257,72.257,0,0,1-1.04-12.02c-0.06-1.83-.06-5.56-0.06-5.56V452.125h0s0.06-11.391.06-12.086a87.9,87.9,0,0,1,1.04-12.025,39.843,39.843,0,0,1,3.78-11.413,38.283,38.283,0,0,1,16.82-16.847,39.762,39.762,0,0,1,11.4-3.785,71.909,71.909,0,0,1,12-1.037c16.99-.567,36.32-0.061,34.51-0.061,5.02,0,6.5,3.439,6.63,6.962a35.611,35.611,0,0,0,1.2,8.156,21.326,21.326,0,0,0,19.18,15.592c2.28,0.192,6.78.355,6.78,0.355H6433.7s4.5-.059,6.79-0.251a21.348,21.348,0,0,0,19.18-15.591,35.582,35.582,0,0,0,1.19-8.154c0.13-3.523,1.61-6.962,6.64-6.962-1.81,0,17.52-.5,34.5.061a71.923,71.923,0,0,1,12.01,1.038,39.832,39.832,0,0,1,11.4,3.784,38.283,38.283,0,0,1,16.82,16.844,40.153,40.153,0,0,1,3.78,11.413,87.844,87.844,0,0,1,1.03,12.023c0,0.695.06,12.084,0.06,12.084h0V1183.64s0,3.72-.06,5.55a72.366,72.366,0,0,1-1.03,12.03,40.2,40.2,0,0,1-3.78,11.41,38.315,38.315,0,0,1-16.82,16.84,40.155,40.155,0,0,1-11.4,3.79,87.669,87.669,0,0,1-12.01,1.03c-1.52,0-9.5.07-12.07,0.07"
                    transform="translate(-6159.12 -394.656)"
                  />
                </clipPath>
              </svg>
              {configs.video_or_screenshot === "video" && (
                <div className="videoContainer">
                  <video
                    className="screenvideo"
                    autoPlay="autoplay"
                    controls="controls"
                  >
                    <source
                      src={data.videoScreen.publicURL}
                      type={`video/${
                        data.videoScreen.extension === "mov"
                          ? `mp4`
                          : data.videoScreen.extension
                      }`}
                    />
                  </video>
                </div>
              )}

              {configs.video_or_screenshot === "screenshot" && (
                <Img
                  fluid={data.iphoneScreen.childImageSharp.fluid}
                  className="iphoneScreen"
                />
              )}
            </div>
            <div className="appInfo">
              <H2>Join the waitlist.</H2>
              {status.state !== "success" && (
                <>
                  <P>
                    We're currently testing with pilots in the U.S. If you're
                    interested in joining the test, or to be notified when the
                    app is available, register below
                  </P>
                  <TheForm
                    onSubmit={data => {
                      setFormData(data)
                      subscribe(data, setInProgress, setStatus)
                    }}
                    error={status.state === "error" ? status.message : ""}
                    disabled={inProgress}
                  />
                </>
              )}
              {status.state === "success" && (
                <>
                  <div style={{ width: "100%" }}>
                    <P>
                      Congratulations. You're on the list. We'll be in touch.
                    </P>
                  </div>
                  <br />
                  <div style={{ width: "100%" }}>
                    <SubmitButton
                      onClick={() => {
                        window.location.href =
                          "mailto:?subject=Check out Share the Air&body=" +
                          makeMailMessage(formData.FNAME + " " + formData.LNAME)
                      }}
                    >
                      Tell a Friend
                    </SubmitButton>
                  </div>
                </>
              )}
            </div>
            <div className="features">
              {configs.features.map(feature => {
                if (feature.title) {
                  return (
                    <div className="feature" key={feature.title}>
                      <div>
                        <span className="fa-stack fa-1x">
                          <i className="iconBack fas fa-circle fa-stack-2x" />
                          <i
                            className={`iconTop fas fa-${
                              feature.fontawesome_icon_name
                            } fa-stack-1x`}
                          />
                        </span>
                      </div>
                      <div className="featureText">
                        <h3>{feature.title}</h3>
                        <p>{feature.description}</p>
                      </div>
                    </div>
                  )
                }
                return null
              })}
            </div>
            <footer>
              <p className="footerText">
                Made by{" "}
                {configs.your_link ? (
                  <a href={configs.your_link}>{configs.your_name}</a>
                ) : (
                  `${configs.your_name}`
                )}
                {configs.your_city && ` in ${configs.your_city}`}
              </p>
              <div className="footerIcons">
                {configs.facebook_username && (
                  <a
                    href={`https://facebook.com/${configs.facebook_username}`}
                    aria-label="Facebook"
                  >
                    <span className="fa-stack fa-1x">
                      <i className="socialIconBack fas fa-circle fa-stack-2x" />
                      <i className="socialIconTop fab fa-facebook fa-stack-1x" />
                    </span>
                  </a>
                )}

                {configs.twitter_username && (
                  <a
                    href={`https://twitter.com/${configs.twitter_username}`}
                    aria-label="Twitter"
                  >
                    <span className="fa-stack fa-1x">
                      <i className="socialIconBack fas fa-circle fa-stack-2x" />
                      <i className="socialIconTop fab fa-twitter fa-stack-1x" />
                    </span>
                  </a>
                )}

                {configs.github_username && (
                  <a
                    href={`https://github.com/${configs.github_username}`}
                    aria-label="GitHub"
                  >
                    <span className="fa-stack fa-1x">
                      <i className="socialIconBack fas fa-circle fa-stack-2x" />
                      <i className="socialIconTop fab fa-github fa-stack-1x" />
                    </span>
                  </a>
                )}

                {configs.email_address && (
                  <a
                    href={`mailto:${configs.email_address}`}
                    aria-label="Email"
                  >
                    <span className="fa-stack fa-1x">
                      <i className="socialIconBack fas fa-circle fa-stack-2x" />
                      <i className="socialIconTop fas fa-envelope fa-stack-1x" />
                    </span>
                  </a>
                )}
              </div>
            </footer>
            {/*TODO: Add App Store API */}
          </div>
        </div>
      </div>
    </Layout>
  )
}

export default WaitListPage

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
