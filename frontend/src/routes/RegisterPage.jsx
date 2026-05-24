import { SignUp } from "@clerk/clerk-react";

const RegisterPage = () => {
    return(
        <div className="flex items-center justify-center h-[calc(100vh-64px)]">
            <SignUp />
        </div>
    )
}

export default RegisterPage;