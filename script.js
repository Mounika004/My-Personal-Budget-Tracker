// This is a comment—notes for you.
document.getElementById('transaction-form').addEventListener('submit', function(event) {
    event.preventDefault(); // Stops page reload.
    
    // Get user inputs.
    let amount = document.getElementById('amount').value;
    let type = document.getElementById('type').value;
    let category = document.getElementById('category').value;
    let date = document.getElementById('date').value;
    
    // Show the new transaction.
    let list = document.getElementById('transactions');
    let item = document.createElement('p');
    item.textContent = `${type}: $${amount} on ${date} in ${category}`;
    list.appendChild(item);
    
    // Clear form.
    document.getElementById('amount').value = '';
    document.getElementById('category').value = '';
    document.getElementById('date').value = '';
});