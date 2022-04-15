import projectsMockData from '../projects/mockdata.jsx'
import usersMockData from '../users/mockdata.jsx'

export default () => ({
  links: { self: 'XXX', next: 'XXX', last: 'XXX', },
  included: [ // assignments reference users and projects
    ...usersMockData().data,
    ...projectsMockData().data,
  ],
  data: usersMockData().data.reduce(
    (prev, ufo)=>[
      ...prev,
      ...projectsMockData().data.map((pfo, idx)=>({
        id:`${ufo.id}-${pfo.id}`,
        type:'tasks',
        attributes:{
          name:['Prepare for Widget Install', 'Install Widget', 'Polish Widget'][idx] || 'Do Something XXX',
        },
        links: { self: 'XXX' },
        relationships: {
          user: {
            links: { self: 'XXX', related: 'XXX', },
            data: {type:'users', id:ufo.id},
          },
          project: {
            links: { self: 'XXX', related: 'XXX', },
            data: {type:'projects', id:pfo.id},
          },
        },
      }))
    ], []
  ),
})
