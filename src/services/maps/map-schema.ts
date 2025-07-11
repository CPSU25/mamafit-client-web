import * as yup from 'yup'

export const defaultLocationValues = {
  id: '',
  name: '',
  address: '',
  lat: 0,
  lng: 0
}

export const locationSchema = yup.object().shape({
  location: yup
    .object()
    .required()
    .shape({
      id: yup.string().required('Please select a location'),
      name: yup.string().required('Please enter a location name'),
      address: yup.string().required('Please enter a location address'),
      lat: yup.number().required('Please enter a location latitude'),
      lng: yup.number().required('Please enter a location longitude')
    })
})
