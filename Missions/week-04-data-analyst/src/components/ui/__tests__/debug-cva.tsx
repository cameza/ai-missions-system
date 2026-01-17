import { cardVariants } from '../card'

// Test CVA directly
console.log('CVA glass variant:', cardVariants({ variant: 'glass', padding: 'default' }))
console.log('CVA default variant:', cardVariants({ variant: 'default', padding: 'default' }))
console.log('CVA none padding:', cardVariants({ variant: 'default', padding: 'none' }))
