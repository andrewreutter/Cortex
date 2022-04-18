export default () => ({
  links: { self: 'XXX', next: 'XXX', last: 'XXX', },
  data: [
    { id:1, type:'users',
      links: { self: 'XXX' },
      attributes: {
        fullname:'Phillip Mundahl',
        username:'pmundahl',
        email: 'phillip@acdistribution.net',
        roles:['Admin', 'Project Manager'],
      },
    },
    { id:2, type:'users',
      links: { self: 'XXX' },
      attributes: {
        fullname:'Avery Pfeiffer',
        username:'apfeiffer',
        email: 'averyp@lionsoft.net',
        roles:['Admin'],
      },
    },
    { id:3, type:'users',
      links: { self: 'XXX' },
      attributes: {
        fullname:'Andrew Reutterkowskigunderson the Third',
        username:'areutter',
        email: 'andrew.reutter@gmail.com',
        roles:['Admin'],
      },
    },
  ]
})
