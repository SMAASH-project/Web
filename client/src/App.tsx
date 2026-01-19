import './App.css'
import './index.css'

// import { SignupForm } from './components/signup-form'
// import { LoginForm } from './components/login-form'
import { PasswordResetForm } from './components/passwordreset-form'

function App() {
    // const hasAccount = true;
    return (
        // <>
        //     {hasAccount ? <LoginForm className="w-100" /> : <SignupForm className="w-100" />}
        // </>
        <PasswordResetForm className="w-100" />
    )
}

export default App
