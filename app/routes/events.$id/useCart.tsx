import { useNavigation, useSubmit } from "@remix-run/react";
import { useCallback, useMemo, useReducer } from "react";
import { useTypedLoaderData } from "remix-typedjson";
import type { loader } from "./loader";

export type ItemState = {
  id: string;
  name: string;
  price: number;
  limit: number | null;
  quantity: number;
  isAvailable: boolean;
};

type CartState = {
  items: Record<string, ItemState>;
  quantity: number;
  total: number;
};

type CartAction = {
  type: "mutate";
  id: string;
  quantity: number;
};

export const useCart = () => {
  const { event } = useTypedLoaderData<typeof loader>();
  const [state, dispatch] = useReducer(reducer, {
    items: Object.fromEntries(
      event.prices.map((price) => [
        price.id,
        {
          id: price.id,
          name: price.name,
          price: price.price,
          limit:
            price.limit == null ? null : price.limit - price._count.tickets,
          quantity: 0,
          isAvailable: true,
        },
      ])
    ),
    quantity: 0,
    total: 0,
  });
  const navigation = useNavigation();
  const submit = useSubmit();

  const add = useCallback(
    (id: string) => dispatch({ type: "mutate", id, quantity: 1 }),
    []
  );
  const remove = useCallback(
    (id: string) => dispatch({ type: "mutate", id, quantity: -1 }),
    []
  );
  const allItems = useMemo(() => Object.values(state.items), [state.items]);
  const items = useMemo(
    () => allItems.filter((item) => item.quantity > 0),
    [allItems]
  );

  const checkout = useCallback(() => {
    submit(items, { method: "POST", encType: "application/json" });
  }, [submit, items]);

  return {
    allItems,
    cart: {
      items,
      quantity: state.quantity,
      total: state.total,
      add,
      remove,
    },
    checkout,
    state: navigation.state === "idle" ? "idle" : "loading",
  };
};

const reducer = (state: CartState, action: CartAction) => {
  switch (action.type) {
    case "mutate": {
      const item = state.items[action.id];
      const quantity = item.quantity + action.quantity;
      return {
        ...state,
        items: {
          ...state.items,
          [action.id]: {
            ...item,
            quantity,
          },
        },
        quantity: state.quantity + action.quantity,
        total: state.total + action.quantity * item.price,
      };
    }
  }
};
