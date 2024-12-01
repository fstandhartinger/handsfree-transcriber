import { useTheme } from "next-themes"
import { Toaster as Sonner } from "sonner"

type ToasterProps = React.ComponentProps<typeof Sonner>

const Toaster = ({ ...props }: ToasterProps) => {
  const { theme = "system" } = useTheme()

  return (
    <Sonner
      theme={theme as ToasterProps["theme"]}
      className="toaster group"
      position="top-center"
      expand={false}
      closeButton={true}
      richColors={true}
      style={{ 
        maxWidth: '50vw',
        left: '50%',
        transform: 'translateX(-50%)',
        marginTop: '1rem'
      }}
      toastOptions={{
        classNames: {
          toast:
            "group toast group-[.toaster]:bg-background group-[.toaster]:text-foreground group-[.toaster]:border-border group-[.toaster]:shadow-lg data-[state=open]:slide-in-from-top-full data-[state=closed]:slide-out-to-top-full",
          description: "group-[.toast]:text-muted-foreground",
          actionButton:
            "group-[.toast]:bg-primary group-[.toast]:text-primary-foreground",
          cancelButton:
            "group-[.toast]:bg-muted group-[.toast]:text-muted-foreground",
        },
        style: {
          background: 'var(--background)',
          border: '1px solid var(--border)',
          borderRadius: '0.5rem',
          width: '100%',
          maxWidth: '50vw'
        }
      }}
      {...props}
    />
  )
}

export { Toaster }