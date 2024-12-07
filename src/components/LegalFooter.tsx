import { Link } from 'react-router-dom'

const LegalFooter = () => {
  return (
    <div className="fixed bottom-0 left-0 p-4 z-40">
      <div className="flex gap-4 text-sm text-muted-foreground">
        <Link 
          to="/terms-and-conditions"
          className="hover:text-foreground transition-colors"
        >
          Terms & Conditions
        </Link>
        <Link 
          to="/data-privacy"
          className="hover:text-foreground transition-colors"
        >
          Privacy Policy
        </Link>
        <Link 
          to="/imprint"
          className="hover:text-foreground transition-colors"
        >
          Imprint
        </Link>
      </div>
    </div>
  )
}

export default LegalFooter 