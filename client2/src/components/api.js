import axios from 'axios'

const http = axios.create({
  baseURL: '/api'
})

const Organization = {
  get () { return http.get(`/organizations`) },
  create (data) { return http.post(`/organizations`, data) }
}

const Donation = {
  get () { return http.get(`/donations`) },
  create (data) { return http.post(`/donations`, data) },
  test (data) { return http.post(`/donations/test`, data) },
  stats () { return http.get(`/donations/stats`) },
  display () { return http.get(`/donations/display`) }
}

const Round = {
  get () { return http.get(`/rounds`) },
  active () { return http.get(`/rounds/active`) }
}

const Action = {
  get (key) { return key ? http.get(`/actions/${key}`) : http.get(`/actions`) },
  update (key, data) { return http.patch(`/actions/${key}`, data) }
}

export {
  Organization,
  Donation,
  Round,
  Action
}
