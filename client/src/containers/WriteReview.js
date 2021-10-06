import { useState, useEffect } from 'react'
import { useHistory } from 'react-router-dom'
import PropTypes from 'prop-types'
import axios from 'axios'
import { Button } from 'react-bootstrap'
import RichText, { InitialValue } from '../components/RichText'
import { getTokenNotExpried } from '../features/PersistentUser'
import Message from '../components/Message'


// for checking array equality
const _ = require('lodash');


/**
 * Blend two colors together.
 * @param {string} color1 - The first color, in hexadecimal format.
 * @param {string} color2 - The second color, in hexadecimal format.
 * @return {string} The blended color.
 */
const WriteReview = ( props ) => {    
    const [message, setMessage] = useState('')
    const [messageStyle, setMessageStyle] = useState('')
    const [isSaved, setIsSaved] = useState(false)
    const [content, setContent] = useState(localStorage.getItem('content') || JSON.stringify(InitialValue))
    const User =  (props.location && props.location.state.User) || ''
    const token = getTokenNotExpried()    
    const history = useHistory()

    const onSave = (e) => {
        e.preventDefault();        

        if (!_.isEqual(content, JSON.stringify(InitialValue))) {
            if (User && User.isSignedIn) {
                if (token) {
                    const AuthString = 'token '.concat(token)

                    axios
                    .post(process.env.REACT_APP_SERVER_BASE_URL + '/reviews/post', { title: 'What is a good review?',
                                                                                     content: content, 
                                                                                     status: 'Draft' }, 
                                                                                    { headers: { Authorization: AuthString }})
                    .then((response) => {
                        setIsSaved(true)
                        setContent(JSON.stringify(InitialValue))
                        setMessageStyle('success_message')   
                        setMessage(response.data.message)       
                    })
                    .catch ((error) => {
                        setMessageStyle('error_message')      
                        if (error.response) {
                          setMessage(error.response.data.message)                
                        } else {
                          console.log('Error', error.message)
                        }
                        setContent(InitialValue)
                    })
                }
            } else {
                history.push('/signin')
            }  
        } else {
            setMessageStyle('error_message')
            setMessage('No review is written.') 
        }
    }

    useEffect(() => {
        const initialize = () => {
            setMessage('')
            setIsSaved(false)
        }

        if (isSaved && message && !_.isEqual(content, JSON.stringify(InitialValue))) {
            initialize()
        }
    }, [isSaved, message, content])

    return (
        <>
            <RichText  setContent={setContent} reset={isSaved} />
            <div className='App-Buttons'>
                <br />
                <Button onClick={e => onSave(e)}>Save</Button>     
                <Message message={message} messageStyle={messageStyle}/>                         
            </div>
        </>
    )
}

WriteReview.propTypes = {
    location: PropTypes.shape({
        state: PropTypes.shape({
            User: PropTypes.shape({
                isSignedIn: PropTypes.bool,
            }),
        }),
    }),
}

export default WriteReview
