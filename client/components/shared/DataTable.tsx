"use client";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import Image from "next/image";
import { Suspense } from "react";
import { IUser, IPagination } from "@/types/types";
import { TableSkeleton } from "../skeletons";
import { formatDate } from "@/lib/helpers";
import { Pagination } from "../helpers";

export const DataTable = ({
  headers,
  data,
  pagination,
  isLoading,
}: {
  headers: { name: string; key: string }[];
  data: IUser[] | undefined;
  pagination?: IPagination;
  isLoading: boolean;
}) => {
  return (
    <div className="w-full">
      <div className="max-h-[58vh] overflow-y-auto">
        <Table>
          <TableHeader>
            <TableRow className="dark:hover:bg-neutral-900 dark:border-neutral-800">
              {headers.map(({ name }, idx) => (
                <TableHead
                  key={idx}
                  className="min-w-[130px] text-text dark:text-darkText"
                >
                  {name}
                </TableHead>
              ))}
            </TableRow>
          </TableHeader>

          <TableBody>
            {isLoading ? (
              <>
                {headers.map((_, idx) => (
                  <TableRow
                    className="dark:hover:bg-neutral-900 dark:border-neutral-800"
                    key={idx}
                  >
                    {headers.map((_, cidx) => (
                      <TableCell key={cidx}>
                        <TableSkeleton />
                      </TableCell>
                    ))}
                  </TableRow>
                ))}
              </>
            ) : (
              <>
                {data && data.length > 0 ? (
                  data.map((user: IUser, idx: number) => (
                    <TableRow
                      className="dark:hover:bg-neutral-900 dark:border-neutral-800 overflow-x-hidden"
                      key={idx}
                    >
                      <TableCell className="min-w-[250px] flex items-center gap-x-2">
                        <Image
                          src={user.avatar || "/images/dummy-user.webp"}
                          alt={user.name}
                          width={200}
                          height={200}
                          className="object-cover size-10 rounded-full"
                        />
                        <p className="text-text dark:text-darkText">
                          {user.name}
                        </p>
                      </TableCell>
                      <TableCell>{user.email}</TableCell>
                      <TableCell>+{user.phone}</TableCell>
                      <TableCell>{user.address || "N/A"}</TableCell>
                      <TableCell>{formatDate(user.createdAt)}</TableCell>
                    </TableRow>
                  ))
                ) : (
                  <TableRow>
                    <TableCell
                      colSpan={headers.length}
                      className="text-start text-3xl pt-10"
                    >
                      No users found
                    </TableCell>
                  </TableRow>
                )}
              </>
            )}
          </TableBody>
        </Table>
      </div>
      {pagination && (
        <Suspense fallback={<p>Loading...</p>}>
          <Pagination data={pagination} />
        </Suspense>
      )}
    </div>
  );
};
