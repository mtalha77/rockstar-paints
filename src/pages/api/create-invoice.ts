import connectDb from 'src/Backend/databaseConnection'
import InvoiceModel from 'src/Backend/schemas/invoice'

const generateUniqueCustomId = async () => {
  const customId = Math.floor(10000 + Math.random() * 90000) // Generates a random 5-digit number

  return customId
}
const handler = async (req: any, res: any) => {
  if (req.method === 'POST') {
    try {
      const customId = await generateUniqueCustomId()
      const newInvoice = new InvoiceModel({ ...req.body, custom_id: customId })

      const saved = await newInvoice.save()

      if (!saved) {
        return res.status(404).send('Not able to save invoice')
      }

      return res.status(201).send({
        message: 'Invoice created successfully',
        payload: { invoice: saved }
      })
    } catch (error) {
      console.error('Error saving invoice:', error)

      return res.status(500).send('Something went wrong')
    }
  } else {
    res.setHeader('Allow', ['POST'])

    return res.status(405).end(`Method ${req.method} Not Allowed`)
  }
}

export default connectDb(handler)
