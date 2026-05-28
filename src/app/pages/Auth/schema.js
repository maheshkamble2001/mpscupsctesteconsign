import * as Yup from 'yup'

export const schema = Yup.object().shape({
    username: Yup.string()
        .trim()
        .required('username is required'),
    password: Yup.string().trim()
        .required('password is required'),
})