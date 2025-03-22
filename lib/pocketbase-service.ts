import PocketBase from "pocketbase"

// Initialize PocketBase client
const pb = new PocketBase("https://wtf.pockethost.io")

// Generate a random passphrase
export async function generatePassphrase() {
  const response = await fetch("https://makemeapassword.ligos.net/api/v1/passphrase/json")
  if (!response.ok) {
    throw new Error("Failed to fetch passphrase")
  }
  const { pws } = await response.json()
  return pws[0]
}

// Create a new SnapSage record
export async function createSnapSageRecord(name: string, data: any) {
  try {
    // Generate a passphrase for the new record
    const passphrase = await generatePassphrase()

    // Set default values if not provided
    const defaultData = {
      GEMINI_API_KEY: null,
      GITHUB_TOKEN: null,
      ...data,
    }

    // Prepare data for the new record
    const recordData = {
      name: name,
      passphrase: passphrase,
      data: JSON.stringify(defaultData), // Convert data object to JSON string
      status: true, // Set status to true by default
    }

    // Create the record (no query params needed for create)
    const record = await pb.collection("SnapSage").create(recordData)

    console.log("Record created successfully:", record)
    console.log("Record ID:", record.id)
    console.log("Passphrase (save this for future access):", passphrase)

    return {
      recordId: record.id,
      passphrase: passphrase,
    }
  } catch (error) {
    console.error("Error creating record:", error)
    throw error
  }
}

// Get SnapSage record ID by passphrase
export async function getRecordIdByPassphrase(passphrase: string) {
  try {
    // Get only 1 record since passphrases are unique
    const resultList = await pb.collection("SnapSage").getList(1, 1, {
      query: {
        passphrase: passphrase,
      },
    })

    if (resultList.items.length === 0) {
      throw new Error("No record found with provided passphrase")
    }

    return resultList.items[0].id
  } catch (error) {
    console.error("Error retrieving record ID:", error)
    throw error
  }
}

// View a SnapSage record by ID (requires passphrase)
export async function viewSnapSageRecord(recordId: string, passphrase: string) {
  try {
    const record = await pb.collection("SnapSage").getOne(recordId, {
      query: {
        passphrase: passphrase,
      },
    })

    console.log("Record retrieved successfully:", record)
    return record
  } catch (error) {
    console.error("Error retrieving record:", error)
    throw error
  }
}

// Update a SnapSage record (requires passphrase)
export async function updateSnapSageRecord(recordId: string, passphrase: string, updatedData: any) {
  try {
    const record = await pb.collection("SnapSage").update(recordId, updatedData, {
      query: {
        passphrase: passphrase,
      },
    })

    console.log("Record updated successfully:", record)
    return record
  } catch (error) {
    console.error("Error updating record:", error)
    throw error
  }
}

// Delete a SnapSage record (requires passphrase)
export async function deleteSnapSageRecord(recordId: string, passphrase: string) {
  try {
    await pb.collection("SnapSage").delete(recordId, {
      query: {
        passphrase: passphrase,
      },
    })

    console.log("Record deleted successfully")
    return true
  } catch (error) {
    console.error("Error deleting record:", error)
    throw error
  }
}

// Workflow function for retrieving a record ID using passphrase first
export async function getAndProcessRecord(
  passphrase: string,
  action: "view" | "update" | "delete",
  updatedData: any = null,
) {
  try {
    // Step 1: Get record ID using passphrase
    const recordId = await getRecordIdByPassphrase(passphrase)

    // Step 2: Perform the requested action
    switch (action) {
      case "view":
        return await viewSnapSageRecord(recordId, passphrase)
      case "update":
        if (!updatedData) throw new Error("Updated data required for update action")
        return await updateSnapSageRecord(recordId, passphrase, updatedData)
      case "delete":
        return await deleteSnapSageRecord(recordId, passphrase)
      default:
        throw new Error("Invalid action specified")
    }
  } catch (error) {
    console.error(`Error in getAndProcessRecord: ${error instanceof Error ? error.message : "Unknown error"}`)
    throw error
  }
}

