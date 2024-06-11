import React, { useEffect, useMemo, useState } from 'react'
import { useForm, Controller } from 'react-hook-form'
import {
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Checkbox,
  Button,
  CircularProgress,
  Grid,
  FormControl,
  TextField,
  Typography,
  Box,
  Select,
  MenuItem,
  Dialog,
  DialogActions,
  DialogContent,
  DialogContentText,
  DialogTitle
} from '@mui/material'
import axios from 'axios'
import toast from 'react-hot-toast'
import { MaterialReactTable, useMaterialReactTable } from 'material-react-table'
import EditIcon from '@mui/icons-material/Edit'
import Link from 'next/link'
import { useRouter } from 'next/router'
import DeleteIcon from '@mui/icons-material/Delete'
import RemoveRedEyeIcon from '@mui/icons-material/RemoveRedEye'
import { statusValues } from 'src/enums'

const Home = () => {
  const [data, setData] = useState<any>([])
  const [openDialog, setOpenDialog] = useState(false)
  const [selectedInvoice, setSelectedInvoice] = useState(null)
  const [deleting, setDeleting] = useState(false)
  const router = useRouter()

  const fetchData = async () => {
    try {
      const res = await axios.get('/api/get-all')
      console.log(res.data.payload.data)
      setData(res.data.payload.data)
    } catch (error) {
      console.log(error)
      toast.error('Error fetching data')
    }
  }

  useEffect(() => {
    fetchData()
  }, [])

  const handleDeleteClick = (invoiceId: string) => {
    setSelectedInvoice(invoiceId)
    setOpenDialog(true)
  }

  const handleConfirmDelete = async () => {
    try {
      setDeleting(true)
      await axios.post('/api/delete', { invoiceId: selectedInvoice })
      setData((prev: any) => {
        return prev.filter((p: any) => {
          return p._id !== selectedInvoice
        })
      })
      toast.success('Invoice deleted successfully')
    } catch (error) {
      console.log(error)
      toast.error('Network Error')
    } finally {
      setDeleting(false)
      setOpenDialog(false)
      setSelectedInvoice(null)
    }
  }

  const handleCancelDelete = () => {
    setOpenDialog(false)
    setSelectedInvoice(null)
  }

  const columns = useMemo(
    () => [
      {
        header: 'Invoice #',
        accessorKey: 'custom_id' //simple recommended way to define a column
      },
      {
        header: 'Issue Date',
        accessorKey: 'issue_date', //simple recommended way to define a column
        Cell: ({ cell }: any) => {
          const value = cell.getValue()

          return value ? new Date(value).toLocaleDateString() : ''
        }
      },
      {
        header: 'Customer Name',
        accessorKey: 'customer_name' //simple recommended way to define a column
      },

      {
        header: 'Total Payment',
        accessorKey: 'total_cost' //simple recommended way to define a column
      },
      {
        header: 'Status',
        accessorKey: 'status', //simple recommended way to define a column,

        Cell: ({ cell }: any) => {
          const { _id } = cell.row.original
          const defaultValue = cell.getValue() ? cell.getValue() : ''
          const [value, setValue] = useState(defaultValue)

          return (
            <>
              <FormControl>
                <Select
                  size='small'
                  sx={{ fontSize: '14px' }}
                  onChange={e => {
                    setValue(e.target.value)
                    updateStatus(_id, e.target.value)
                  }}
                  value={value}
                  displayEmpty
                  inputProps={{ 'aria-label': 'Without label' }}
                >
                  {statusValues.map((e: any) => {
                    return (
                      <MenuItem key={e} value={e}>
                        {e}
                      </MenuItem>
                    )
                  })}
                </Select>
              </FormControl>
            </>
          )
        }
      },

      {
        header: 'Actions',
        accessorKey: 'actions',
        Cell: ({ cell }: any) => {
          const { _id } = cell.row.original

          return (
            <Box display={'flex'}>
              <div
                onClick={() => {
                  router.push(`create?invoiceId=${_id}&view=true`)
                }}
                style={{ cursor: 'pointer' }}
              >
                <RemoveRedEyeIcon />
              </div>
              <div style={{ width: '15px' }}></div>
              <div
                onClick={() => {
                  router.push(`create?invoiceId=${_id}`)
                }}
                style={{ cursor: 'pointer' }}
              >
                <EditIcon />
              </div>
              <div style={{ width: '15px' }}></div>
              <div onClick={() => handleDeleteClick(_id)} style={{ cursor: 'pointer' }}>
                {deleting && selectedInvoice === _id ? <CircularProgress size={25} /> : <DeleteIcon />}
              </div>
            </Box>
          )
        }
      }
    ],
    [deleting, selectedInvoice, router]
  )

  const table = useMaterialReactTable({
    columns,
    data,
    enableColumnActions: false,
    enableSorting: false,
    enableDensityToggle: false,
    enableFullScreenToggle: false,
    enableHiding: false
  })

  return (
    <>
      <Box textAlign={'right'} mb={5}>
        <Link href={'/create'} legacyBehavior>
          <Button variant='contained'>Create +</Button>
        </Link>
      </Box>
      <MaterialReactTable table={table} />
      <Dialog open={openDialog} onClose={handleCancelDelete}>
        <DialogTitle>Confirm Deletion</DialogTitle>
        <DialogContent>
          <DialogContentText>
            Are you sure you want to delete this invoice? This action cannot be undone.
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCancelDelete} color='primary'>
            Cancel
          </Button>
          <Button onClick={handleConfirmDelete} color='primary' autoFocus>
            Confirm
          </Button>
        </DialogActions>
      </Dialog>
    </>
  )
}

export default Home
