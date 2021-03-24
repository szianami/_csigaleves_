/* src/App.js */
import React, { useEffect, useState } from 'react'
import Amplify, { API, graphqlOperation } from 'aws-amplify'

import { withAuthenticator } from '@aws-amplify/ui-react'
import awsExports from "./aws-exports";

// import { createTodo } from './graphql/mutations'
// import { listTodos } from './graphql/queries'



Amplify.configure(awsExports);

const initialState = { name: '', description: '' }

const App = () => {

  var client_id = '112749c7d49944b2b2333eb3b8ebc3df'; // Your client id
  var client_secret = '4825b1d514e144feb6a2630857507e00'; // Your secret
  var redirect_uri = 'REDIRECT_URI'; // Your redirect uri

 // const [formState, setFormState] = useState(initialState)
 // const [todos, setTodos] = useState([])

  useEffect(() => {
   // fetchTodos()
  }, [])

  async function syncSpotify() {
    try {
      // küldjön egy hívást a spotify felé az auth kérelmemmel
      /*
      if (!formState.name || !formState.description) return
      const todo = { ...formState }
      setTodos([...todos, todo])
      setFormState(initialState)
      await API.graphql(graphqlOperation(createTodo, {input: todo}))
      */
    } catch (err) {
      console.log('error creating todo:', err)
    }
  }



  return (
    <div style={styles.container}>

      <button style={styles.button} onClick={syncSpotify}>CONNECT YOUR SPOTIFY</button>
      

      <h2>Amplify Todos</h2>
      
    </div>
  )
}

const styles = {
  container: { width: 400, margin: '0 auto', display: 'flex', flexDirection: 'column', justifyContent: 'center', padding: 20 },
  todo: {  marginBottom: 15 },
  input: { border: 'none', backgroundColor: '#ddd', marginBottom: 10, padding: 8, fontSize: 18 },
  todoName: { fontSize: 20, fontWeight: 'bold' },
  todoDescription: { marginBottom: 0 },
  button: { backgroundColor: 'black', color: 'white', outline: 'none', fontSize: 18, padding: '12px 0px' }
}

// export default App
export default withAuthenticator(App)