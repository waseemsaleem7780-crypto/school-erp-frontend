{/* Assignment card ke andar, description ke baad */}
{a.file_path && (
    <a 
        href={a.file_path} 
        target="_blank" 
        rel="noopener noreferrer" 
        style={{
            display: 'inline-block',
            marginTop: '12px',
            padding: '10px 20px',
            backgroundColor: '#48bb78',
            color: 'white',
            borderRadius: '8px',
            textDecoration: 'none',
            fontSize: '14px',
            fontWeight: '600',
        }}
    >
        📥 Download Assignment
    </a>
)}