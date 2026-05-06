export default function Qualification() {
    return (
        <>

        <style>
        {`

        .qualification {
         position: relative;
         width: 100%;
         height: 100svh;
         display: flex;
         justify-content: center;
         align-items: center;
         background-color: var(--base-300);
         color: var(--base-100);
        }

        .qualification h1 {
         width: 40%;
         text-align: center;
        }

        @media (max-width: 1000px) {
         .qualification h1 {
           width: calc(100% - 4rem);
         }
        }
        
        `}
        </style>

        <section className="qualification">
            <h1> Qualification </h1>
        </section>
        </>
    )
}